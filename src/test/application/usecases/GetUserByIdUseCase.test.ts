import { GetUserByIdUseCase } from "@src/application/usecases/user/GetUserByIdUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

const user = {
  id: "user-id",
  name: "Test User",
  email: "test@example.com",
  password: "hash",
  isVerified: true,
};

describe("GetUserByIdUseCase", () => {
  const mockRepository = {
    getUserById: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  let useCase: GetUserByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetUserByIdUseCase(mockRepository as any, mockLogger as any);
  });

  it("usuario no encontrado", async () => {
    mockRepository.getUserById.mockResolvedValueOnce(null);

    await expect(useCase.execute(user.id)).rejects.toThrow(ApplicationError);
    expect(mockLogger.info).toHaveBeenCalledWith(`User with id ${user.id} not found`);
  });

  it("caso feliz", async () => {
    mockRepository.getUserById.mockResolvedValueOnce(user);

    const result = await useCase.execute(user.id);

    expect(result).toEqual(user);
  });

  it("error inesperado del repositorio", async () => {
    mockRepository.getUserById.mockRejectedValueOnce(new Error("db"));

    await expect(useCase.execute(user.id)).rejects.toThrow(ApplicationError);
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
