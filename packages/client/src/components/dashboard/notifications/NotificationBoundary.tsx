import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onError?: () => void;
}

interface State {
  hasError: boolean;
}

class NotificationBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError();
    }
  }

  public render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default NotificationBoundary;
