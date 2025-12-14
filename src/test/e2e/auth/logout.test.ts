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
  userRepository: {},
}));

jest.mock("@src/infrastructure/factories/securityServiceFactory", () => ({
  securityService: {},
}));

jest.mock("@src/infrastructure/factories/emailServiceFactory", () => ({
  emailService: {},
}));

import express from "express";
import request from "supertest";
import { AuthRoutes } from "@src/presentation/auth/authRoutes";
import { ILogger } from "@src/interfaces/Logger";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/shared/constants";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", AuthRoutes.routes);
  return app;
};

describe("POST /auth/logout", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  it("returns 200 and clears the refresh token cookie", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", [`${REFRESH_TOKEN_COOKIE_NAME}=existing`]);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Logged out successfully",
    });

    const rawCookies = response.headers["set-cookie"];
    expect(rawCookies).toBeDefined();

    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    const logoutCookie = cookies.find((c) =>
      c.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    );

    expect(logoutCookie).toBeDefined();
    expect(logoutCookie).toContain(`${REFRESH_TOKEN_COOKIE_NAME}=;`);
    expect(logoutCookie).toContain("Expires=");
  });

  it("returns 500 when response fails to clear cookie", async () => {
    const app = createTestApp();
    const originalClearCookie = app.response.clearCookie;

    // Mock the implementation of clearCookie on the response object prototype
    // This is a bit of a hack, but it's necessary to test this specific failure case
    // without affecting other tests.
    const clearCookieMock = jest.fn(function (this: express.Response) {
      throw new Error("clear failed");
    });
    
    Object.defineProperty(app.response, 'clearCookie', {
      value: clearCookieMock,
      configurable: true,
    });

    const response = await request(app).post("/auth/logout");

    expect(response.status).toBe(500);

    // Restore original implementation
    Object.defineProperty(app.response, 'clearCookie', {
      value: originalClearCookie,
      configurable: true,
    });
  });
});