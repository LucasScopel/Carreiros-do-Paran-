import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "database";
import { AppError } from "@/utils/errors";
import type { ApiErrorResponse } from "shared/types";

type UniqueConstraintMeta = {
  cause?: {
    constraint?: {
      fields?: string[];
    };
  };
};

/**
 * Middleware global de tratamento de erros.
 *
 * Converte erros da aplicação, validação e banco em respostas HTTP padronizadas.
 *
 * @see {@link ApiErrorResponse}
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Erros da aplicação
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    const fields = Object.fromEntries(
      err.issues.map((issue) => [issue.path.join("."), issue.message]),
    );

    return res.status(400).json({
      code: "VALIDATION_ERROR",
      fields,
    });
  }

  // Erros do banco de dados
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Violação de unique constraint (ex: email já cadastrado)
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

      // Registro não encontrado no banco de dados
      case "P2025":
        return res.status(404).json({
          code: "NOT_FOUND",
        });
    }
  }

  // Erros não tratados acima são considerados falhas inesperadas
  console.error(err);

  return res.status(500).json({
    code: "INTERNAL_ERROR",
  });
}
