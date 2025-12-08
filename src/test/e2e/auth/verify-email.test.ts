import express from "express";
import request from "supertest";

const childLoggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};
childLoggerMock.child.mockReturnValue(childLoggerMock);

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(() => childLoggerMock),
};

const securityServiceMock = {
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
};

const userRepositoryMock = {
  getUserById: jest.fn(),
  verifyUser: jest.fn(),
};

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

jest.mock("@src/infrastructure/logs", () => ({ logger: loggerMock }));

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: securityServiceMock,
}));

jest.mock("@src/infrastructure/factories/userRepositoryFactory", () => ({
  userRepository: userRepositoryMock,
}));

import { AuthRoutes } from "@src/presentation/auth/authRoutes";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  (app.request as any).cookies = {};
  app.use("/auth", AuthRoutes.routes);
  return app;
};

describe("AuthRoutes - verify-email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and verifies the user when token is valid", async () => {
    const app = buildApp();
    const user = {
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "hashed",
      isVerified: false,
    };

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: user.id });
    userRepositoryMock.getUserById.mockResolvedValueOnce(user);
    userRepositoryMock.verifyUser.mockResolvedValueOnce({ ...user, isVerified: true });

    const response = await request(app).get("/auth/verify-email/valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: user.id, email: user.email, isVerified: true },
    });
  });

  it("returns 200 when user is already verified", async () => {
    const app = buildApp();
    const user = {
      id: "user-2",
      name: "User",
      email: "user2@example.com",
      password: "hashed",
      isVerified: true,
    };

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: user.id });
    userRepositoryMock.getUserById.mockResolvedValueOnce(user);

    const response = await request(app).get("/auth/verify-email/already-verified");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { id: user.id, email: user.email, isVerified: true },
    });
    expect(userRepositoryMock.verifyUser).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockResolvedValueOnce(null);

    const response = await request(app).get("/auth/verify-email/invalid");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, message: "Token is invalid" });
  });

  it("returns 400 when user does not exist", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: "missing" });
    userRepositoryMock.getUserById.mockResolvedValueOnce(null);

    const response = await request(app).get("/auth/verify-email/unknown");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "User not found" });
  });

  it("returns 500 on unexpected repository error", async () => {
    const app = buildApp();

    securityServiceMock.verifyToken.mockResolvedValueOnce({ id: "user-3" });
    userRepositoryMock.getUserById.mockRejectedValueOnce(new Error("db down"));

    const response = await request(app).get("/auth/verify-email/error");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ success: false, message: "Internal server error" });
  });
});
