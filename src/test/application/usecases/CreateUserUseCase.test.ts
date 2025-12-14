import { CreateUserUseCase } from "@src/application/usecases/user/CreateUserUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

const userInput = {
  name: "Test User",
  email: "test@example.com",
  password: "plain-pass",
};

describe("CreateUserUseCase", () => {
  const mockUserRepository = {
    createUser: jest.fn(),
  };

  const mockSecurityService = {
    hashPassword: jest.fn(),
    generateToken: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
  };

  const mockChildLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  let useCase: CreateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateUserUseCase(
      mockUserRepository as any,
      mockSecurityService as any,
      mockEmailService as any,
      mockLogger as any,
    );
  });

  it("caso feliz", async () => {
    const createdUser = { id: "user-id", ...userInput, password: "hashed" } as const;
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockUserRepository.createUser.mockResolvedValueOnce(createdUser);
    mockSecurityService.generateToken.mockResolvedValueOnce("verification-token");
    mockEmailService.sendVerificationEmail.mockResolvedValueOnce(undefined);

    const result = await useCase.execute(userInput as any);

    expect(result).toEqual(createdUser);
    expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(userInput.password);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      ...userInput,
      password: "hashed",
    });
    expect(mockSecurityService.generateToken).toHaveBeenCalledWith(
      { id: createdUser.id },
      "1h",
    );
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      createdUser,
      "verification-token",
    );
  });

  it("error inesperado en hashPassword", async () => {
    mockSecurityService.hashPassword.mockRejectedValueOnce(new Error("hash"));

    await expect(useCase.execute(userInput as any)).rejects.toThrow(
      ApplicationError,
    );
  });

  it("error inesperado en createUser", async () => {
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockUserRepository.createUser.mockRejectedValueOnce(new Error("repo"));

    await expect(useCase.execute(userInput as any)).rejects.toThrow(
      ApplicationError,
    );
  });

  it("error inesperado en generateToken", async () => {
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    mockUserRepository.createUser.mockResolvedValueOnce({
      id: "user-id",
      ...userInput,
      password: "hashed",
    });
    mockSecurityService.generateToken.mockRejectedValueOnce(new Error("jwt"));

    await expect(useCase.execute(userInput as any)).rejects.toThrow(
      ApplicationError,
    );
  });

  it("error inesperado en sendVerificationEmail", async () => {
    mockSecurityService.hashPassword.mockResolvedValueOnce("hashed");
    const createdUser = { id: "user-id", ...userInput, password: "hashed" };
    mockUserRepository.createUser.mockResolvedValueOnce(createdUser);
    mockSecurityService.generateToken.mockResolvedValueOnce("verification-token");
    mockEmailService.sendVerificationEmail.mockRejectedValueOnce(new Error("mail"));

    await expect(useCase.execute(userInput as any)).rejects.toThrow(
      ApplicationError,
    );
  });
});
