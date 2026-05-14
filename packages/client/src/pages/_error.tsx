"use client";

import ErrorPage from "@/components/ErrorPage";
import { NextPageContext } from "next";

export const dynamic = "force-dynamic";

interface ErrorProps {
  statusCode?: number;
}

const CustomError = ({ statusCode }: ErrorProps) => {
  // Handle specific error codes
  if (statusCode === 404) {
    return <ErrorPage errorKey="404" />;
  }

  if (statusCode === 500) {
    return <ErrorPage errorKey="500" />;
  }

  // Generic error for any other status code
  return <ErrorPage errorKey="generic" errorCode={statusCode?.toString()} />;
};

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
