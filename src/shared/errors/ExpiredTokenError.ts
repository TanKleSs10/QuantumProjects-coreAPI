import { InfrastructureError } from "./InfrastructureError";
import { BaseErrorOptions } from "./BaseError";

export class ExpiredTokenError extends InfrastructureError {
  constructor(message = "Token has expired", options?: BaseErrorOptions) {
    super(message, options);
  }
}
