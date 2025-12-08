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
  getUserByEmail: jest.fn(),
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

describe("AuthRoutes - login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and sets tokens on successful login", async () => {
    const app = buildApp();
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: "hashed",
      isVerified: true,
    };

    userRepositoryMock.getUserByEmail.mockResolvedValueOnce(user);
    securityServiceMock.verifyPassword.mockResolvedValueOnce(true);
    securityServiceMock.generateToken
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const response = await request(app)
      .post("/auth/login")
      .send({ email: user.email, password: "plain-password" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name } },
      token: "access-token",
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("refresh_token=refresh-token")]),
    );
  });

  it("returns 400 for invalid payload", async () => {
    const app = buildApp();

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(typeof response.body.message).toBe("string");
  });

  it("returns 400 when credentials are invalid", async () => {
    const app = buildApp();
    userRepositoryMock.getUserByEmail.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "missing@example.com", password: "secret123" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "Invalid credentials" });
  });

  it("returns 400 when email is not verified", async () => {
    const app = buildApp();
    const user = {
      id: "user-2",
      name: "Test User",
      email: "test2@example.com",
      password: "hashed",
      isVerified: false,
    };

    userRepositoryMock.getUserByEmail.mockResolvedValueOnce(user);
    securityServiceMock.verifyPassword.mockResolvedValueOnce(true);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: user.email, password: "secret123" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "Email is not verified" });
  });

  it("returns 500 on unexpected repository error", async () => {
    const app = buildApp();
    userRepositoryMock.getUserByEmail.mockRejectedValueOnce(new Error("db down"));

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "secret123" });

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ success: false, message: "Internal server error" });
  });
});
