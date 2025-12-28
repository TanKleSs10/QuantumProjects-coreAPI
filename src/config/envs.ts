import { get } from "env-var";

export const envs = {
  PORT: get("PORT").required().asPortNumber(),
  ENVIRONMENT: get("NODE_ENV").default("development").asString(),
  LOKI_HOST: get("LOKI_HOST").required().asString(),
  URI_DB: get("MONGODB_URI").required().asString(),
  FRONTEND_URL: get("FRONTEND_URL").default("http://localhost:3000").asString(),
  CORS_CREDENTIALS: get("CORS_CREDENTIALS").default("false").asBool(),
  APP_URL: get("APP_URL").default("http://localhost:3000").asString(),
  JWT_SECRET: get("JWT_SECRET").required().asString(),
  REFRESH_JWT_SECRET: get("REFRESH_JWT_SECRET").required().asString(),
  VERIFY_JWT_SECRET: get("VERIFY_JWT_SECRET").required().asString(),
  RESET_JWT_SECRET: get("RESET_JWT_SECRET").required().asString(),
  JWT_EXPIRES_IN: get("JWT_EXPIRES_IN").default("1h").asString(),
  SMTP_HOST: get("SMTP_HOST").required().asString(),
  SMTP_PORT: get("SMTP_PORT").required().asPortNumber(),
  SMTP_USER: get("SMTP_USER").required().asString(),
  SMTP_PASS: get("SMTP_PASS").required().asString(),
  SMTP_SECURE: get("SMTP_SECURE").default("false").asBool(),
};
