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
    hashPassword: jest.fn(),
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
    const updatedUser = { ...existingUser, password: "hashed", name: "New" };
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockRepository.updateUser.mockResolvedValueOnce(updatedUser);

    const result = await useCase.execute(existingUser.id, {
      name: "New",
      password: "plain",
    });

    expect(result).toEqual(updatedUser);
    expect(mockSecurityService.hashPassword).toHaveBeenCalledWith("plain");
    expect(mockRepository.updateUser).toHaveBeenCalledWith(existingUser.id, {
      name: "New",
      password: "hashed",
    });
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
    mockSecurityService.hashPassword.mockRejectedValueOnce(new Error("hash"));

    await expect(
      useCase.execute(existingUser.id, { password: "plain" }),
    ).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });

  it("error inesperado del repositorio", async () => {
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockRepository.updateUser.mockRejectedValueOnce(new Error("db"));

    await expect(
      useCase.execute(existingUser.id, { password: "plain" }),
    ).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
