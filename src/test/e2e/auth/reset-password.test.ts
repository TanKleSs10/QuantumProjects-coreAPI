/**
 * reset-password.e2e.test.ts
 */

jest.mock("@src/config/envs", () => ({
  envs: {
    PORT: 3000,
    ENVIRONMENT: "test",
    LOKI_HOST: "http://localhost",
    URI_DB: "mongodb://localhost",
    FRONTEND_URL: "http://localhost:3000",
    APP_URL: "http://localhost:3000",
    JWT_SECRET: "secret",
    JWT_EXPIRES_IN: "1h",
    SMTP_HOST: "smtp.local",
    SMTP_PORT: 587,
    SMTP_USER: "user",
    SMTP_PASS: "pass",
    SMTP_SECURE: false,
  },
}));

/**
 * LoggerFactory mock
 */
jest.mock("@src/infrastructure/logs/LoggerFactory", () => {
  const fakeChild: any = {};

  Object.assign(fakeChild, {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    getLevel: jest.fn(() => "debug"),
    child: jest.fn(() => fakeChild),
  });

  return {
    createLogger: jest.fn(() => fakeChild),
  };
});

/**
 * Service & repository mocks
 */
const securityServiceMock = {
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
};

const userRepositoryMock = {
  getUserById: jest.fn(),
  updatePassword: jest.fn(),
};

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: securityServiceMock,
}));

jest.mock("@src/infrastructure/factories/userRepositoryFactory", () => ({
  userRepository: userRepositoryMock,
}));

jest.mock("@src/infrastructure/factories/lockoutServiceFactory", () => ({
  lockoutService: {
    isLocked: jest.fn().mockReturnValue(false),
    registerFail: jest.fn(),
    clear: jest.fn(),
  },
}));

/**
 * Imports AFTER mocks
 */
import express from "express";
import request from "supertest";
import { AuthRoutes } from "@src/presentation/auth/authRoutes";

/**
 * App builder
 */
const buildApp = () => {
  const app = express();
  app.use(express.json());
  (app.request as any).cookies = {};
  app.use("/api/v1/auth", AuthRoutes.routes);
  return app;
};

describe("AuthRoutes - reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 on successful password reset", async () => {
    const app = buildApp();

    const user = {
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "old-hash",
      isVerified: true,
    };

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: user.id });
    userRepositoryMock.getUserById.mockResolvedValueOnce(user);
    securityServiceMock.hashPassword.mockResolvedValueOnce("new-hash");
    userRepositoryMock.updatePassword.mockResolvedValueOnce({
      ...user,
      password: "new-hash",
    });

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "valid", password: "newPassword123" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Password updated successfully",
    });
  });

  it("returns 400 for invalid payload", async () => {
    const app = buildApp();

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("returns 401 for invalid token", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "invalid", password: "Validpass1" });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: "Token is invalid",
    });
  });

  it("returns 400 when user is not found", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: "missing" });
    userRepositoryMock.getUserById.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "valid", password: "Validpass1" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: "User not found",
    });
  });

  it("returns 500 on unexpected error", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockRejectedValueOnce(
      new Error("token failure"),
    );

    const response = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "valid", password: "Validpass1" });

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      success: false,
      message: "Internal server error",
    });
  });
});
