import { GetAllUsersUseCase } from "@src/application/usecases/user/GetAllUsersUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

const sampleUsers = [
  { id: "1", name: "User 1", email: "u1@test.com", password: "p1", isVerified: true },
  { id: "2", name: "User 2", email: "u2@test.com", password: "p2", isVerified: false },
];

describe("GetAllUsersUseCase", () => {
  const mockRepository = {
    getAllUsers: jest.fn(),
  };

  const mockChildLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  let useCase: GetAllUsersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAllUsersUseCase(
      mockRepository as any,
      mockLogger as any,
    );
  });

  it("repositorio devuelve null", async () => {
    mockRepository.getAllUsers.mockResolvedValueOnce(null);

    await expect(useCase.execute()).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalledWith(
      "User repository returned null",
    );
  });

  it("sin usuarios", async () => {
    mockRepository.getAllUsers.mockResolvedValueOnce([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockChildLogger.info).toHaveBeenCalledWith("No users found");
  });

  it("caso feliz", async () => {
    mockRepository.getAllUsers.mockResolvedValueOnce(sampleUsers);

    const result = await useCase.execute();

    expect(result).toEqual(sampleUsers);
    expect(mockChildLogger.info).toHaveBeenCalledWith(
      "Users retrieved successfully",
      { count: sampleUsers.length },
    );
  });

  it("error inesperado del repositorio", async () => {
    mockRepository.getAllUsers.mockRejectedValueOnce(new Error("db"));

    await expect(useCase.execute()).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
