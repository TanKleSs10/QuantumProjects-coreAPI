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
    verifyPassword: jest.fn(),
    generateToken: jest.fn(),
  },
}));

import express from "express";
import request from "supertest";
import { AuthRoutes } from "@src/presentation/auth/authRoutes";
import { ILogger } from "@src/interfaces/Logger";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/shared/constants";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", AuthRoutes.routes);
  return app;
};

describe("POST /api/v1/auth/login", () => {
  let app: ReturnType<typeof createTestApp>;

  const { userRepository } = jest.requireMock(
    "@src/infrastructure/factories/userRepositoryFactory",
  );
  const { securityService } = jest.requireMock(
    "@src/infrastructure/factories/securityServiceFactory",
  );

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  it("returns 200 and tokens on success", async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      name: "Test User",
      isVerified: true,
    });

    securityService.verifyPassword.mockResolvedValue(true);
    securityService.generateToken
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@test.com",
      password: "12345678",
    });

    // Normalize cookie extraction for different environments
    const rawCookies = res.headers["set-cookie"];
    expect(rawCookies).toBeDefined();

    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

    const loginCookie = cookies.find((c) =>
      c.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    );
    expect(loginCookie).toBeDefined();

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("access-token");
    expect(res.body.data.user.email).toBe("test@test.com");
  });

  it("returns 400 if user does not exist", async () => {
    userRepository.getUserByEmail.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "notfound@test.com",
      password: "12345678",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 if password is invalid", async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      isVerified: true,
    });

    securityService.verifyPassword.mockResolvedValue(false);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 if email is not verified", async () => {
    userRepository.getUserByEmail.mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      isVerified: false,
    });

    securityService.verifyPassword.mockResolvedValue(true);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@test.com",
      password: "12345678",
    });

    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    userRepository.getUserByEmail.mockRejectedValue(new Error("DB ERROR"));

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@test.com",
      password: "12345678",
    });

    expect(res.status).toBe(500);
  });
});
