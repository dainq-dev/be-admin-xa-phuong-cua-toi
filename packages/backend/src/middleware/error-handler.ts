/**
 * Global Error Handler Middleware
 * Production-safe error handling with detailed logging
 */

import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../lib/env";

const isProduction = env.NODE_ENV === "production";

export const errorHandler: ErrorHandler = (err, c) => {
  // Generate request ID for tracking
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();

  // Structured logging for production
  const logData = {
    requestId,
    method: c.req.method,
    path: c.req.path,
    error: err.message,
    stack: isProduction ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  };

  if (isProduction) {
    console.error(JSON.stringify(logData));
  } else {
    console.error("Error:", err);
  }

  c.header("x-request-id", requestId);

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        requestId,
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      400,
    );
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return c.json(
        {
          error: "Duplicate entry",
          requestId,
          message: "A record with this value already exists",
        },
        409,
      );
    }
    if (err.code === "P2025") {
      return c.json(
        {
          error: "Not found",
          requestId,
          message: "The requested record was not found",
        },
        404,
      );
    }
    if (err.code === "P2003") {
      return c.json(
        {
          error: "Invalid reference",
          requestId,
          message: "Referenced record does not exist",
        },
        400,
      );
    }
    if (isProduction) {
      return c.json(
        {
          error: "Database error",
          requestId,
          message: "An error occurred while processing your request",
        },
        500,
      );
    }
  }

  // JWT/Auth errors
  if (
    err.message.includes("token") ||
    err.message.includes("Invalid") ||
    err.message.includes("expired")
  ) {
    return c.json(
      {
        error: "Authentication failed",
        requestId,
        message: isProduction ? "Authentication failed" : err.message,
      },
      401,
    );
  }

  // Business logic errors
  if (
    err.message.includes("not found") ||
    err.message.includes("Not found") ||
    err.message.includes("inactive") ||
    err.message.includes("locked") ||
    err.message.includes("attempts")
  ) {
    const status = err.message.toLowerCase().includes("not found") ? 404 : 400;
    return c.json(
      {
        error: err.message.includes("not found") ? "Not found" : "Bad request",
        requestId,
        message: err.message,
      },
      status,
    );
  }

  // Default error
  return c.json(
    {
      error: "Internal server error",
      requestId,
      message: isProduction
        ? "An unexpected error occurred. Please try again later."
        : err.message || "Something went wrong",
    },
    500,
  );
};
