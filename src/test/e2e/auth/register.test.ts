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
  createUser: jest.fn(),
};

const emailServiceMock = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendNotificationEmail: jest.fn(),
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

jest.mock("@src/infrastructure/factories/emailServiceFactory", () => ({
  emailService: emailServiceMock,
}));

import { UserRoutes } from "@src/presentation/user/userRoutes";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/users", UserRoutes.routes);
  return app;
};

describe("UserRoutes - register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 201 when user is created successfully", async () => {
    const app = buildApp();
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: "hashed",
      isVerified: false,
    };

    securityServiceMock.hashPassword.mockResolvedValueOnce("hashed-password");
    userRepositoryMock.createUser.mockResolvedValueOnce(user);
    securityServiceMock.generateToken.mockResolvedValueOnce("verification-token");

    const response = await request(app).post("/users").send({
      name: user.name,
      email: user.email,
      password: "plainPassword123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "user created success",
      data: user,
    });
    expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      user,
      "verification-token",
    );
  });

  it("returns 400 for invalid payload", async () => {
    const app = buildApp();

    const response = await request(app).post("/users").send({ email: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "Invalid user data" });
  });

  it("returns 400 when repository throws an error", async () => {
    const app = buildApp();

    securityServiceMock.hashPassword.mockResolvedValueOnce("hashed-password");
    userRepositoryMock.createUser.mockRejectedValueOnce(new Error("db error"));

    const response = await request(app).post("/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "plainPassword123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: "Failed to create user" });
  });
});
