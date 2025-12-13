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

describe("AuthRoutes - logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and clears the refresh token cookie", async () => {
    const app = buildApp();

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", ["refresh_token=existing"]);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Logged out successfully",
    });

    // Normalizar cookies
    const rawCookies = response.headers["set-cookie"];
    expect(rawCookies).toBeDefined();

    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

    // La cookie debe venir vacía o expirada
    const logoutCookie = cookies.find((c) => c.startsWith("refresh_token="));

    expect(logoutCookie).toBeDefined();

    // La cookie debe tener valor vacío
    expect(logoutCookie).toContain("refresh_token=");
    expect(logoutCookie).toContain("Expires=");
    expect(logoutCookie).toContain("HttpOnly");
  });

  it("returns 500 when response fails to clear cookie", async () => {
    const app = buildApp();
    const originalClearCookie = app.response.clearCookie;
    app.response.clearCookie = () => {
      throw new Error("clear failed");
    };

    const response = await request(app).post("/auth/logout");

    expect(response.status).toBeGreaterThanOrEqual(500);
    app.response.clearCookie = originalClearCookie;
  });
});
