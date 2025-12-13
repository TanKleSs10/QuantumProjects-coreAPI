import request from "supertest";
import express, { Express } from "express";

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

jest.mock("@src/infrastructure/logs", () => {
  const fakeChild = {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  return {
    logger: {
      child: jest.fn(() => fakeChild),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    },
  };
});

// 👇 AHORA IMPORTAS LO DEMÁS
import { AuthRoutes } from "@src/presentation/auth/authRoutes";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";

// -----------------------------
// MOCKS DE FACTORIES
// -----------------------------
jest.mock("@src/infrastructure/factories/userRepositoryFactory", () => ({
  userRepository: {
    getUserByEmail: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: {
    verifyPassword: jest.fn(),
    generateToken: jest.fn(),
  },
}));

// -----------------------------
// APP PARA TESTING
// -----------------------------
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use("/auth", AuthRoutes.routes);
  return app;
};

describe("POST /auth/login", () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  it("should return 200 and tokens on login success", async () => {
    (userRepository.getUserByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      name: "Test User",
      isVerified: true,
    });

    (securityService.verifyPassword as jest.Mock).mockResolvedValue(true);

    (securityService.generateToken as jest.Mock)
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const res = await request(app).post("/auth/login").send({
      email: "test@test.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@test.com");
    expect(res.body.accessToken).toBe("access-token");
    expect(res.body.refreshToken).toBe("refresh-token");
  });

  it("should return 400 if user does not exist", async () => {
    (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post("/auth/login").send({
      email: "notfound@test.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
  });

  it("should return 400 if password is invalid", async () => {
    (userRepository.getUserByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      isVerified: true,
    });

    (securityService.verifyPassword as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post("/auth/login").send({
      email: "test@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(400);
  });

  it("should return 400 if email is not verified", async () => {
    (userRepository.getUserByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@test.com",
      password: "hashed",
      isVerified: false,
    });

    (securityService.verifyPassword as jest.Mock).mockResolvedValue(true);

    const res = await request(app).post("/auth/login").send({
      email: "test@test.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
  });

  it("should return 500 when an unexpected error happens", async () => {
    (userRepository.getUserByEmail as jest.Mock).mockRejectedValue(
      new Error("DB ERROR"),
    );

    const res = await request(app).post("/auth/login").send({
      email: "test@test.com",
      password: "123456",
    });

    expect(res.status).toBe(500);
  });
});
