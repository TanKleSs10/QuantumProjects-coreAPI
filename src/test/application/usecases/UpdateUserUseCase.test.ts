import { UpdateUserUseCase } from "@src/application/usecases/user/UpdateUserUseCase";
import { DomainError } from "@src/shared/errors/DomainError";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

const existingUser = {
  id: "user-id",
  name: "Old Name",
  email: "old@example.com",
  password: "old-pass",
  isVerified: false,
};

describe("UpdateUserUseCase", () => {
  const mockRepository = {
    updateUser: jest.fn(),
  };

  const mockSecurityService = {
  };

  const mockChildLogger = {
    debug: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateUserUseCase(
      mockRepository as any,
      mockSecurityService as any,
      mockLogger as any,
    );
  });

  it("actualiza contraseña hasheada", async () => {
    const updatedUser = { ...existingUser, name: "New" };
    mockRepository.updateUser.mockResolvedValueOnce(updatedUser);

    const result = await useCase.execute(existingUser.id, {
      name: "New",
    });

    expect(result).toEqual(updatedUser);
    expect(mockRepository.updateUser).toHaveBeenCalledWith(existingUser.id, {
      name: "New",
    });
  });

  it("rechaza cambios de password", async () => {
    await expect(
      useCase.execute(existingUser.id, { password: "plain" } as any),
    ).rejects.toThrow(DomainError);
    expect(mockRepository.updateUser).not.toHaveBeenCalled();
  });

  it("usuario no encontrado", async () => {
    mockRepository.updateUser.mockResolvedValueOnce(null);

    await expect(useCase.execute(existingUser.id, {})).rejects.toThrow(
      DomainError,
    );
    expect(mockChildLogger.warn).toHaveBeenCalledWith("User not found for update", {
      userId: existingUser.id,
    });
  });

  it("error inesperado en hashPassword", async () => {
    mockRepository.updateUser.mockRejectedValueOnce(new Error("hash"));

    await expect(useCase.execute(existingUser.id, { name: "New" })).rejects.toThrow(
      ApplicationError,
    );
    expect(mockChildLogger.error).toHaveBeenCalled();
  });

  it("error inesperado del repositorio", async () => {
    mockRepository.updateUser.mockRejectedValueOnce(new Error("db"));

    await expect(
      useCase.execute(existingUser.id, { name: "New" }),
    ).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
