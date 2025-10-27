import { get } from "env-var";

export const envs = {
  PORT: get("PORT").required().asPortNumber(),
  ENVIRONMENT: get("NODE_ENV").default("development").asString(),
  LOKI_HOST: get("LOKI_HOST").required().asString(),
  URI_DB: get("MONGODB_URI").required().asString(),
};
