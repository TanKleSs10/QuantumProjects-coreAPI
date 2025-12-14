// 👇 IMPORTA PRIMERO LOS MOCKS DE ENVS Y LOGGER
jest.mock("@src/config/envs", () => ({
  envs: {
    PORT: 3000,
    ENVIRONMENT: "test",
    LOKI_HOST: "http://localhost",
    URI_DB: "mongodb://test",
    JWT_SECRET: "secret123",
    REFRESH_JWT_SECRET: "refresh123",
    SMTP_HOST: "smtp.test.com",
    SMTP_PORT: 587,
    SMTP_USER: "test",
    SMTP_PASS: "test",
    SMTP_SECURE: false,
  },
}));

jest.mock("@src/infrastructure/logs/LoggerFactory", () => {
  const logger: ILogger = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
    getLevel: jest.fn().mockReturnValue("debug"),
  };

  return { createLogger: () => logger };
});

// -----------------------------
// MOCKS DE FACTORIES
// -----------------------------

jest.mock("@src/infrastructure/factories/userRepositoryFactory", () => ({
  userRepository: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    verifyUser: jest.fn(),
    updatePassword: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: {
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/emailServiceFactory", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendNotificationEmail: jest.fn(),
  },
}));

import express from "express";
import request from "supertest";
import { AuthRoutes } from "@src/presentation/auth/authRoutes";
import { ILogger } from "@src/interfaces/Logger";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", AuthRoutes.routes);
  return app;
};

describe("POST /auth/register", () => {
  let app: ReturnType<typeof createTestApp>;

  const { userRepository } = jest.requireMock(
    "@src/infrastructure/factories/userRepositoryFactory",
  );
  const { securityService } = jest.requireMock(
    "@src/infrastructure/factories/securityServiceFactory",
  );
  const { emailService } = jest.requireMock(
    "@src/infrastructure/factories/emailServiceFactory",
  );

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  it("returns 201 when user is created successfully", async () => {
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      password: "hashed",
      isVerified: false,
    };

    securityService.hashPassword.mockResolvedValue("hashed-password");
    userRepository.createUser.mockResolvedValue(user);
    securityService.generateToken.mockResolvedValue("verification-token");

    const response = await request(app).post("/auth/register").send({
      name: user.name,
      email: user.email,
      password: "plainPassword123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "Check your email to verify your account",
      data: { user },
    });
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      user,
      "verification-token",
    );
  });

  it("returns 400 for invalid payload", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: "Invalid input: expected string, received undefined",
    });
  });

  it("returns 500 when repository throws an error", async () => {
    securityService.hashPassword.mockResolvedValue("hashed-password");
    userRepository.createUser.mockRejectedValue(new Error("db error"));

    const response = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "plainPassword123",
    });

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      success: false,
      message: "Internal server error",
    });
  });
});

