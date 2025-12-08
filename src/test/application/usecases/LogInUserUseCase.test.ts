import { LogInUserUseCase } from "@src/application/usecases/auth/LogInUserUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

describe("LogInUserUseCase", () => {
  const mockRepository = {
    getUserByEmail: jest.fn(),
  };

  const mockSecurityService = {
    verifyPassword: jest.fn(),
    generateToken: jest.fn(),
  };

  const mockChildLogger = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  const validUser = {
    id: "user-id",
    name: "Test User",
    email: "test@example.com",
    password: "hashed-password",
    isVerified: true,
  };

  const logInDTO = { email: validUser.email, password: "plain-password" };

  let useCase: LogInUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LogInUserUseCase(
      mockRepository as any,
      mockSecurityService as any,
      mockLogger as any,
    );
  });

  it("usuario no encontrado", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(null);

    await expect(useCase.execute(logInDTO)).rejects.toThrow(DomainError);
    expect(mockRepository.getUserByEmail).toHaveBeenCalledWith(validUser.email);
    expect(mockChildLogger.warn).toHaveBeenCalled();
  });

  it("contraseña inválida", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(validUser);
    mockSecurityService.verifyPassword.mockResolvedValueOnce(false);

    await expect(useCase.execute(logInDTO)).rejects.toThrow(DomainError);
    expect(mockSecurityService.verifyPassword).toHaveBeenCalledWith(
      logInDTO.password,
      validUser.password,
    );
    expect(mockChildLogger.warn).toHaveBeenCalled();
  });

  it("email no verificado", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce({
      ...validUser,
      isVerified: false,
    });
    mockSecurityService.verifyPassword.mockResolvedValueOnce(true);

    await expect(useCase.execute(logInDTO)).rejects.toThrow(DomainError);
    expect(mockChildLogger.warn).toHaveBeenCalled();
  });

  it("caso feliz (retorna tokens y usuario)", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(validUser);
    mockSecurityService.verifyPassword.mockResolvedValueOnce(true);
    mockSecurityService.generateToken
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await useCase.execute(logInDTO);

    expect(result).toEqual({
      user: {
        id: validUser.id,
        name: validUser.name,
        email: validUser.email,
      },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(mockSecurityService.generateToken).toHaveBeenCalledTimes(2);
  });

  it("error inesperado en el repositorio", async () => {
    mockRepository.getUserByEmail.mockRejectedValueOnce(
      new Error("repo failure"),
    );

    await expect(useCase.execute(logInDTO)).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });

  it("error inesperado en verifyPassword", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(validUser);
    mockSecurityService.verifyPassword.mockRejectedValueOnce(
      new Error("hash error"),
    );

    await expect(useCase.execute(logInDTO)).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });

  it("error inesperado en generateToken", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(validUser);
    mockSecurityService.verifyPassword.mockResolvedValueOnce(true);
    mockSecurityService.generateToken.mockRejectedValueOnce(
      new Error("jwt failure"),
    );

    await expect(useCase.execute(logInDTO)).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
