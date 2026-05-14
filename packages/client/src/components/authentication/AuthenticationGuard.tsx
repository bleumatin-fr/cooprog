import { Component, ReactNode, useEffect, useRef } from "react";

import { NextRouter, useRouter } from "next/router";

import { useAuthentication } from "./useAuthentication";
import useUser from "./useUser";
import ProfileSelectDialog from "./ProfileSelectDialog";

interface ErrorBoundaryProps {
  children?: ReactNode;
  router: NextRouter;
}

interface ErrorBoundaryState {
  error: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    error: null,
  };

  public componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState,
  ) {
    if (prevState.error === this.state.error) return;
    if (!this.state.error) return;

    const redirectUrl = {
      pathname: `/authentication/login`,
      query: {
        error: this.state.error,
        redirect: this.props.router.asPath,
      },
    };
    localStorage.removeItem("auth");
    void this.props.router
      .replace(redirectUrl, undefined, {
        locale: this.props.router.locale,
      })
      .catch(() => undefined);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (error.message === "Awaiting moderation") {
      localStorage.removeItem("auth");
      return { error: "moderation" };
    }
    if (error.message === "Unauthorized") {
      localStorage.removeItem("auth");
      return { error: "unauthorized" };
    }
    return { error: null };
  }

  public render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}

interface AuthenticationGuardProps {
  children: ReactNode;
  suppressError?: boolean;
}

const AuthenticationGuard = ({
  children,
  suppressError,
}: AuthenticationGuardProps) => {
  const { auth, logout } = useAuthentication();
  const router = useRouter();
  const {
    user,
    error,
    loading,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    previouslySelectedProfileId,
  } = useUser({ useErrorBoundary: false });
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (redirectingRef.current) return;
    if (!loading && error && (!auth || !auth.token)) {
      redirectingRef.current = true;
      const target = {
        pathname: `/authentication/login`,
        query: {
          redirect: router.asPath,
          error:
            (error as any)?.message === "Unauthorized"
              ? "unauthorized"
              : undefined,
        },
      };
      localStorage.removeItem("auth");
      void router.replace(target).then(() => {
        redirectingRef.current = false;
      });
    }
  }, [auth, error, loading, router]);

  useEffect(() => {
    if (suppressError) return;
    if (redirectingRef.current) return;
    // Wait until user query settles before deciding the user must be redirected.
    if (loading) return;
    // Logged-in users can exist while auth state is propagating.
    if (user) return;
    if (!auth || !auth.token) {
      redirectingRef.current = true;
      const target = {
        pathname: `/authentication/login`,
        query: {
          redirect: router.asPath,
          error: "unauthorized",
        },
      };
      void router.replace(target).then(() => {
        redirectingRef.current = false;
      });
    }
  }, [auth, loading, suppressError, router, user]);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleClose = () => {
    const foundProfile = user?.profiles?.find(
      (p) => p._id?.toString() === previouslySelectedProfileId?.toString(),
    );
    if (foundProfile?._id) {
      setSelectedProfileId(foundProfile?._id);
      return;
    }

    const firstProfile = user?.profiles?.[0] ?? null;
    if (firstProfile?._id) {
      setSelectedProfileId(firstProfile?._id);
      return;
    }

    logout();
  };

  return (
    <ErrorBoundary router={router}>
      {children}
      {user && !selectedProfile && (
        <ProfileSelectDialog
          open={!!user && !selectedProfile}
          user={user ?? null}
          onSelectProfile={handleProfileSelect}
          onClose={handleClose}
        />
      )}
    </ErrorBoundary>
  );
};

export default AuthenticationGuard;
