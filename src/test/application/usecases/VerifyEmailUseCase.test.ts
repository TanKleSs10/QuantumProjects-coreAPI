import { VerifyEmailUseCase } from "@src/application/usecases/auth/VerifyEmailUseCase";
import { DomainError } from "@src/shared/errors/DomainError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";

const baseUser = {
  id: "user-id",
  name: "Test User",
  email: "test@example.com",
  password: "hash",
  isVerified: false,
};

describe("VerifyEmailUseCase", () => {
  const mockSecurityService = {
    verifyToken: jest.fn(),
  };

  const mockUserRepository = {
    getUserById: jest.fn(),
    verifyUser: jest.fn(),
  };

  const mockChildLogger = {
    warn: jest.fn(),
    info: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  let useCase: VerifyEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VerifyEmailUseCase(
      mockSecurityService as any,
      mockUserRepository as any,
      mockLogger as any,
    );
  });

  it("entrada inválida", async () => {
    await expect(useCase.execute("")).rejects.toThrow(DomainError);
    expect(mockChildLogger.warn).toHaveBeenCalledWith(
      "Verification token not provided",
    );
  });

  it("token inválido", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce(null);

    await expect(useCase.execute("token")).rejects.toThrow(InvalidTokenError);
    expect(mockChildLogger.warn).toHaveBeenCalledWith("Invalid verification token");
  });

  it("usuario no encontrado", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(null);

    await expect(useCase.execute("token")).rejects.toThrow(DomainError);
    expect(mockChildLogger.warn).toHaveBeenCalled();
  });

  it("usuario ya verificado", async () => {
    const verifiedUser = { ...baseUser, isVerified: true };
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: verifiedUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(verifiedUser);

    const result = await useCase.execute("token");

    expect(result).toEqual(verifiedUser);
    expect(mockUserRepository.verifyUser).not.toHaveBeenCalled();
    expect(mockChildLogger.info).toHaveBeenCalledWith("User already verified", {
      userId: verifiedUser.id,
    });
  });

  it("caso feliz", async () => {
    const verifiedUser = { ...baseUser, isVerified: true };
    mockSecurityService.verifyToken.mockResolvedValueOnce({ id: baseUser.id });
    mockUserRepository.getUserById.mockResolvedValueOnce(baseUser);
    mockUserRepository.verifyUser.mockResolvedValueOnce(verifiedUser);

    const result = await useCase.execute("token");

    expect(result).toEqual(verifiedUser);
    expect(mockUserRepository.verifyUser).toHaveBeenCalledWith(baseUser.id);
    expect(mockChildLogger.info).toHaveBeenCalledWith("User verified successfully", {
      userId: verifiedUser.id,
    });
  });

  it("error inesperado en verifyToken", async () => {
    mockSecurityService.verifyToken.mockRejectedValueOnce(new Error("jwt"));

    await expect(useCase.execute("token")).rejects.toThrow(Error);
  });
});
