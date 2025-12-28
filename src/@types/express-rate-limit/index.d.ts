declare module "express-rate-limit" {
  import { RequestHandler } from "express";

  const rateLimit: (options?: Record<string, unknown>) => RequestHandler;
  export default rateLimit;
}
