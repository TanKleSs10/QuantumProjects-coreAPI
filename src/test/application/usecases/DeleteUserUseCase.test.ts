import { DeleteUserUseCase } from "@src/application/usecases/user/DeleteUserUseCase";
import { DomainError } from "@src/shared/errors/DomainError";

describe("DeleteUserUseCase", () => {
  const mockRepository = {
    deleteUser: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteUserUseCase(
      mockRepository as any,
      mockLogger as any,
    );
  });

  it("usuario no encontrado", async () => {
    mockRepository.deleteUser.mockResolvedValueOnce(false);

    await expect(useCase.execute("missing-id")).rejects.toThrow(DomainError);
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("caso feliz", async () => {
    mockRepository.deleteUser.mockResolvedValueOnce(true);

    await expect(useCase.execute("user-id")).resolves.toBe(true);
  });

  it("error inesperado del repositorio", async () => {
    mockRepository.deleteUser.mockRejectedValueOnce(new Error("db"));

    await expect(useCase.execute("user-id")).rejects.toThrow(DomainError);
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
