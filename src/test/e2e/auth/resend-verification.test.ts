// 👇 IMPORTA PRIMERO LOS MOCKS DE ENVS Y LOGGER
jest.mock("@src/config/envs", () => ({
  envs: {
    PORT: 3000,
    ENVIRONMENT: "test",
    LOKI_HOST: "http://localhost",
    URI_DB: "mongodb://test",
    FRONTEND_URL: "http://localhost:3000",
    APP_URL: "http://localhost:3000",
    JWT_SECRET: "secret123",
    REFRESH_JWT_SECRET: "refresh123",
    VERIFY_JWT_SECRET: "verify123",
    RESET_JWT_SECRET: "reset123",
    JWT_EXPIRES_IN: "1h",
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

jest.mock("@src/infrastructure/factories/userRepositoryFactory", () => ({
  userRepository: {
    getUserByEmail: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: {
    generateToken: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/emailServiceFactory", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
  },
}));

import express from "express";
import request from "supertest";
import { AuthRoutes } from "@src/presentation/auth/authRoutes";
import { ILogger } from "@src/interfaces/Logger";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", AuthRoutes.routes);
  return app;
};

describe("POST /api/v1/auth/resend-verification", () => {
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

  it("returns 200 and sends verification email when user is unverified", async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@test.com",
      isVerified: false,
    });
    securityService.generateToken.mockResolvedValueOnce("verify-token");

    const res = await request(app)
      .post("/api/v1/auth/resend-verification")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(200);
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
  });

  it("returns 200 when user is already verified", async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@test.com",
      isVerified: true,
    });

    const res = await request(app)
      .post("/api/v1/auth/resend-verification")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(200);
    expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("returns 200 even when user does not exist", async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/v1/auth/resend-verification")
      .send({ email: "missing@test.com" });

    expect(res.status).toBe(200);
    expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload", async () => {
    const res = await request(app)
      .post("/api/v1/auth/resend-verification")
      .send({ email: "bad-email" });

    expect(res.status).toBe(400);
  });
});
