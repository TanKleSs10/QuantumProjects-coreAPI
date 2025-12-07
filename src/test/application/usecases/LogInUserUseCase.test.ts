import { LogInUserUseCase } from "@src/application/usecases/auth/LogInUserUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

describe("LoginUseCase", () => {
  let mockRepository: any;
  let mockSecurity: any;
  let mockLogger: any;
  let useCase: LogInUserUseCase;

  beforeEach(() => {
    mockRepository = {
      getUserByEmail: jest.fn(),
    };
    mockSecurity = {
      verifyPassword: jest.fn(),
      generateToken: jest.fn(),
    };
    useCase = new LogInUserUseCase(mockRepository, mockSecurity, mockLogger);
  });

  it("should fail if email is invalid", async () => {
    mockRepository.getUserByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "tes@test.com", password: "password" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should fail if password is invalid", async () => {
    mockRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      name: "Test",
      isVerified: true,
    });

    await expect(
      useCase.execute({
        email: "test@test.com",
        password: "superpass123",
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw apploication error if user is not verified", async () => {
    mockRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      name: "Test",
      isVerified: true,
    });

    await expect(
      useCase.execute({ email: "test1@test.com", password: "hashed" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should login successfully and throw and return token", async () => {
    mockRepository.getUserByEmail.mockResolvedValue({
      id: "a3eb170b-87e1-4b8e-b22c-de02f9d6b2ea",
      email: "test@test.com",
      password: "hashed",
      name: "Test",
      isVerified: true,
    });

    mockSecurity.verifyPassword.mockResolvedValue(true);

    mockSecurity.generateToken
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await useCase.execute({
      email: "test@test.com",
      password: "pass",
    });

    expect(result.user.email).toBe("test@test.com");
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
  });

  it("should throw ApplicationError whe verifypassword throws", async () => {
    mockRepository.getUserByEmail.mockResolvedValue({
      id: "c5b70fda-5c90-41b1-9e50-ad5d44ed2945",
      email: "test@test.com",
      password: "hashed",
      name: "Test",
      isVerified: "true",
    });

    mockSecurity.verifyPassword.mockRejectedValue(new Error("bcrypt fail"));

    await expect(
      useCase.execute({ email: "test@test.com", password: "123456" }),
    ).rejects.toThrow(ApplicationError);
  });

  it("should throw ApplicationError when generateToken fails", async () => {
    mockRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      name: "Test",
      isVerified: true,
    });

    mockSecurity.verifyPassword.mockResolvedValue(true);
    mockSecurity.generateToken.mockRejectedValue(new Error("jwt error"));

    await expect(
      useCase.execute({ email: "test@test.com", password: "123456" }),
    ).rejects.toThrow(ApplicationError);
  });
});
