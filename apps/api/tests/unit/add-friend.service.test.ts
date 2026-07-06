import { prismaMock } from "../setup";
import { describe, it, expect } from "vitest";
import { addFriend } from "@/modules/users/service";
import { NotFoundError, BadRequestError } from "@/utils/errors";

describe("addFriend", () => {
  const requesterId = BigInt(1);
  const receiverId = BigInt(2);
  const receiverPublicId = "user-public-id-abc";

  it("deve enviar um novo pedido de amizade com sucesso quando não houver relação prévia", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: receiverId } as any);
    prismaMock.friendship.findFirst.mockResolvedValue(null);
    prismaMock.friendship.create.mockResolvedValue({} as any);

    const result = await addFriend(requesterId, receiverPublicId);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { publicId: receiverPublicId },
      select: { id: true },
    });
    expect(prismaMock.friendship.create).toHaveBeenCalledWith({
      data: { requesterId, receiverId },
    });
    expect(result).toBe("sent-request");
  });

  it("deve lançar NotFoundError se o usuário receptor não existir", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(addFriend(requesterId, receiverPublicId)).rejects.toThrowError(
      NotFoundError,
    );

    // Garante que o código parou no primeiro if e não buscou amizades
    expect(prismaMock.friendship.findFirst).not.toHaveBeenCalled();
  });

  it("deve lançar BadRequestError se o usuário tentar adicionar a si mesmo", async () => {
    // Simulando que o ID retornado do banco é o mesmo de quem pediu
    prismaMock.user.findUnique.mockResolvedValue({ id: requesterId } as any);

    await expect(addFriend(requesterId, receiverPublicId)).rejects.toThrowError(
      new BadRequestError(
        "Você não pode enviar um pedido de amizade para si mesmo.",
      ),
    );
  });

  it("deve lançar BadRequestError se a amizade já estiver aceita", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: receiverId } as any);

    // Simula amizade já existente e ativa
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 10,
      requesterId,
      receiverId,
      accepted: true,
    } as any);

    await expect(addFriend(requesterId, receiverPublicId)).rejects.toThrowError(
      new BadRequestError("Vocês já são amigos."),
    );
  });

  it("deve lançar BadRequestError se o usuário atual já tiver enviado o pedido e ele estiver pendente", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: receiverId } as any);

    // Simula pedido pendente onde o requesterId é o mesmo do teste
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 10,
      requesterId: requesterId, // enviado por mim
      receiverId: receiverId,
      accepted: false,
    } as any);

    await expect(addFriend(requesterId, receiverPublicId)).rejects.toThrowError(
      new BadRequestError(
        "Você já enviou um pedido para este usuário. Aguarde a resposta.",
      ),
    );
  });

  it("deve aceitar o pedido automaticamente através de uma transaction se o pedido foi enviado pela outra pessoa", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: receiverId } as any);

    // Simula pedido pendente enviado pelo outro usuário
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 99,
      requesterId: receiverId, // enviado pelo outro
      receiverId: requesterId, // recebido por mim
      accepted: false,
    } as any);

    prismaMock.$transaction.mockResolvedValue([{}, {}, {}]);

    const result = await addFriend(requesterId, receiverPublicId);

    // Verifica se a transação do Prisma foi invocada com os 3 passos corretos
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.friendship.update).toHaveBeenCalledWith({
      where: { id: 99 },
      data: { accepted: true },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: requesterId },
      data: { friendCount: { increment: 1 } },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: receiverId },
      data: { friendCount: { increment: 1 } },
    });

    expect(result).toBe("accepted");
  });
});
