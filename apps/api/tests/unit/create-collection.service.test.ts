import { prismaMock } from "../setup";
import { describe, it, expect, vi } from "vitest";
import { createCollection } from "@/modules/users/service";
import { BadRequestError, ConflictError } from "@/utils/errors";
import { Prisma } from "database";
import { nanoid } from "nanoid";

describe("createCollection", () => {
  const userId = BigInt(1);
  const validData = {
    name: "Minha Coleção",
    visibility: "PUBLIC" as any,
  };
  const mockPublicId = "mocked-nano-id-123";

  const mockCount = vi.mocked(prismaMock.trailCollection.count);
  const mockCreate = vi.mocked(prismaMock.trailCollection.create);
  const mockNanoid = vi.mocked(nanoid);

  it("deve criar uma coleção com sucesso e retornar o publicId", async () => {
    // Cenário: usuário tem 2 coleções (abaixo do limite de 16)
    mockNanoid.mockReturnValue(mockPublicId);
    mockCount.mockResolvedValue(2);
    mockCreate.mockResolvedValue({
      publicId: mockPublicId,
      name: validData.name,
      isDefault: false,
    } as any);

    const result = await createCollection(userId, validData);

    expect(mockCount).toHaveBeenCalledWith({
      where: { userId },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        publicId: mockPublicId,
        userId,
        ...validData,
      },
      select: {
        publicId: true,
        name: true,
        isDefault: true,
      },
    });
    expect(result).toBe(mockPublicId);
  });

  it("deve lançar BadRequestError se o limite de coleções for atingido", async () => {
    // Cenário: usuário já atingiu o limite de 16 coleções
    mockCount.mockResolvedValue(16);

    await expect(createCollection(userId, validData)).rejects.toThrow(
      new BadRequestError("Collection limit reached"),
    );

    // O create não deve ser chamado
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictError se o nome da coleção já existir (Erro P2002 do Prisma)", async () => {
    // Cenário: usuário já tem coleção com certo nome
    mockCount.mockResolvedValue(0);

    // Simula o erro de restrição única do Prisma
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0" },
    );
    mockCreate.mockRejectedValue(prismaError);

    await expect(createCollection(userId, validData)).rejects.toThrow(
      new ConflictError("A collection with this name already exists"),
    );
  });

  it("qualquer outro erro inesperado lançado pelo Prisma", async () => {
    mockCount.mockResolvedValue(0);

    const genericError = new Error("Erro de conexão com o banco");
    mockCreate.mockRejectedValue(genericError);

    await expect(createCollection(userId, validData)).rejects.toThrow(
      genericError,
    );
  });
});
