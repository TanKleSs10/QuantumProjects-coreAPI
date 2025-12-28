import { RefreshTokenUseCase } from "@src/application/usecases/auth/RefreshTokenUseCase";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

describe("RefreshTokenUseCase", () => {
  const mockSecurityService = {
    verifyToken: jest.fn(),
    generateToken: jest.fn(),
  };

  const mockChildLogger = {
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockLogger = {
    child: jest.fn(() => mockChildLogger),
  } as const;

  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshTokenUseCase(
      mockSecurityService as any,
      mockLogger as any,
    );
  });

  it("entrada inválida", async () => {
    await expect(useCase.execute("")).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.warn).toHaveBeenCalledWith(
      "Refresh token not provided",
    );
  });

  it("token inválido", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({ type: "access" });

    await expect(useCase.execute("bad-token")).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.warn).toHaveBeenCalledWith("Invalid refresh token");
  });

  it("caso feliz", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({
      id: "user-id",
      type: "refresh",
    });
    mockSecurityService.generateToken
      .mockResolvedValueOnce("new-access")
      .mockResolvedValueOnce("new-refresh");

    const result = await useCase.execute("valid-token");

    expect(result).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(mockSecurityService.generateToken).toHaveBeenNthCalledWith(
      1,
      { id: "user-id", type: "access" },
      "access",
      "15m",
    );
    expect(mockSecurityService.generateToken).toHaveBeenNthCalledWith(
      2,
      { id: "user-id", type: "refresh" },
      "refresh",
      "7d",
    );
  });

  it("error inesperado en verifyToken", async () => {
    mockSecurityService.verifyToken.mockRejectedValueOnce(new Error("boom"));

    await expect(useCase.execute("token")).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });

  it("error inesperado en generateToken", async () => {
    mockSecurityService.verifyToken.mockResolvedValueOnce({
      id: "user-id",
      type: "refresh",
    });
    mockSecurityService.generateToken.mockRejectedValueOnce(new Error("jwt"));

    await expect(useCase.execute("token")).rejects.toThrow(ApplicationError);
    expect(mockChildLogger.error).toHaveBeenCalled();
  });
});
