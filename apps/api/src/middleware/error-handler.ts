import type { ErrorRequestHandler } from "express";

function isInvalidJsonError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (isInvalidJsonError(err)) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body is not valid JSON",
      },
    });

    return;
  }

  console.error(err);

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
