import { GetUserByEmailUseCase } from "@src/application/usecases/user/GetUserByEmailUseCase";
import { DomainError } from "@src/shared/errors/DomainError";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

const user = {
  id: "user-id",
  name: "Test User",
  email: "test@example.com",
  password: "hash",
  isVerified: true,
};

describe("GetUserByEmailUseCase", () => {
  const mockRepository = {
    getUserByEmail: jest.fn(),
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

  let useCase: GetUserByEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetUserByEmailUseCase(
      mockRepository as any,
      mockLogger as any,
    );
  });

  it("usuario no encontrado", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(null);

    await expect(useCase.execute(user.email)).rejects.toThrow(DomainError);
    expect(mockChildLogger.warn).toHaveBeenCalledWith("User not found", {
      email: user.email,
    });
  });

  it("caso feliz", async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(user);

    const result = await useCase.execute(user.email);

    expect(result).toEqual(user);
    expect(mockChildLogger.info).toHaveBeenCalledWith("User retrieved successfully", {
      userId: user.id,
    });
  });

  it("error inesperado del repositorio", async () => {
    mockRepository.getUserByEmail.mockRejectedValueOnce(new Error("db"));

    await expect(useCase.execute(user.email)).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
