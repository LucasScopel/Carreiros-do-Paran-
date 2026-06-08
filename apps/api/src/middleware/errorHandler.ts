import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "database";
import { AppError } from "@/utils/errors";

type UniqueConstraintMeta = {
  cause?: {
    constraint?: {
      fields?: string[];
    };
  };
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const fields = Object.fromEntries(
      err.issues.map((issue) => [issue.path.join("."), issue.message]),
    );

    return res.status(400).json({
      code: "VALIDATION_ERROR",
      fields,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Unique constraint
      case "P2002": {
        const meta = err.meta?.driverAdapterError as UniqueConstraintMeta;
        const fields = meta.cause?.constraint?.fields ?? [];

        if (fields.includes("email")) {
          return res.status(409).json({
            code: "EMAIL_TAKEN",
          });
        }

        break;
      }

      // Record not found
      case "P2025":
        return res.status(404).json({
          code: "NOT_FOUND",
        });
    }
  }

  console.error(err);

  return res.status(500).json({
    code: "INTERNAL_ERROR",
  });
}
