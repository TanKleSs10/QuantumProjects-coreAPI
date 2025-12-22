import express from "express";
import request from "supertest";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/shared/constants";

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
  app.use("/api/v1/auth", AuthRoutes.routes);
  return app;
};

describe("AuthRoutes - refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and rotates tokens when refresh token is valid", async () => {
    const app = buildApp();
    Object.assign(app.request, {
      cookies: { [REFRESH_TOKEN_COOKIE_NAME]: "valid-refresh" },
    });

    securityServiceMock.verifyToken.mockResolvedValueOnce({
      id: "user-1",
      type: "refresh",
    });
    securityServiceMock.generateToken
      .mockResolvedValueOnce("new-access")
      .mockResolvedValueOnce("new-refresh");

    const response = await request(app).post("/api/v1/auth/refresh");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, token: "new-access" });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          `${REFRESH_TOKEN_COOKIE_NAME}=new-refresh`,
        ),
      ]),
    );
  });

  it("returns 401 when refresh token is missing", async () => {
    const app = buildApp();

    const response = await request(app).post("/api/v1/auth/refresh");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, message: "Refresh token is required" });
  });

  it("returns 500 when refresh token is invalid", async () => {
    const app = buildApp();
    Object.assign(app.request, {
      cookies: { [REFRESH_TOKEN_COOKIE_NAME]: "invalid" },
    });

    securityServiceMock.verifyToken.mockRejectedValueOnce(new InvalidTokenError());

    const response = await request(app).post("/api/v1/auth/refresh");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ success: false, message: "Internal server error" });
  });

  it("returns 500 on unexpected generation error", async () => {
    const app = buildApp();
    Object.assign(app.request, {
      cookies: { [REFRESH_TOKEN_COOKIE_NAME]: "valid-refresh" },
    });

    securityServiceMock.verifyToken.mockResolvedValueOnce({
      id: "user-1",
      type: "refresh",
    });
    securityServiceMock.generateToken.mockRejectedValueOnce(new Error("signing failed"));

    const response = await request(app).post("/api/v1/auth/refresh");

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ success: false, message: "Internal server error" });
  });
});
