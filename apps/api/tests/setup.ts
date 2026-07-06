import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { prisma, PrismaClient } from "database";

vi.mock("database", async (importOriginal) => {
  const originalModule = await importOriginal<typeof import("database")>();

  return {
    ...originalModule,
    prisma: mockDeep<PrismaClient>(),
  };
});

vi.mock("nanoid", () => ({
  nanoid: vi.fn(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
