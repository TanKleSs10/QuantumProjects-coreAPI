import { ResetPasswordUseCase } from "@src/application/usecases/auth/ResetPasswordUseCase";
import { DomainError } from "@src/shared/errors/DomainError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";

const baseUser = {
  id: "user-id",
  name: "Test User",
  email: "test@example.com",
  password: "old-hash",
  isVerified: true,
};

describe("ResetPasswordUseCase", () => {
  const mockSecurityService = {
    verifyToken: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockUserRepository = {
    getUserById: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
    info: jest.fn(),
  };

  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResetPasswordUseCase(
      mockSecurityService as any,
      mockUserRepository as any,
      mockLogger as any,
    );
  });

  it("entrada inválida: token faltante", async () => {
    await expect(useCase.execute("", "new-pass")).rejects.toThrow(DomainError);
  });

  it("entrada inválida: contraseña faltante", async () => {
    await expect(useCase.execute("token", "")).rejects.toThrow(DomainError);
  });

  it("token inválido", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce(null);

    await expect(useCase.execute("token", "new-pass")).rejects.toThrow(
      InvalidTokenError,
    );
  });

  it("usuario no encontrado", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(null);

    await expect(useCase.execute("token", "new-pass")).rejects.toThrow(
      DomainError,
    );
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("fallo al actualizar contraseña", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(baseUser);
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockUserRepository.updatePassword.mockResolvedValueOnce(null);

    await expect(useCase.execute("token", "new-pass")).rejects.toThrow(
      DomainError,
    );
  });

  it("caso feliz", async () => {
    const updatedUser = { ...baseUser, password: "hashed" } as const;
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(baseUser);
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockUserRepository.updatePassword.mockResolvedValueOnce(updatedUser);

    const result = await useCase.execute("token", "new-pass");

    expect(result).toEqual(updatedUser);
    expect(mockSecurityService.hashPassword).toHaveBeenCalledWith("new-pass");
    expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
      baseUser.id,
      "hashed",
    );
  });

  it("error inesperado en hashPassword", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(baseUser);
    mockSecurityService.hashPassword.mockRejectedValueOnce(new Error("hash"));

    await expect(useCase.execute("token", "new-pass")).rejects.toThrow(Error);
  });
});
