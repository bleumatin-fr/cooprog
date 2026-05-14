import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  Sentry.captureException(error);

  if (error instanceof HttpError) {
    response.status(error.status || 500);
    response.send({
      message: error.message,
      error: error,
    });
    next();
    return;
  }

  console.error(error);
  response.status(500);
  response.send({
    error: "Something went wrong", // Prevent from leaking sensible data
  });

  next();
};
