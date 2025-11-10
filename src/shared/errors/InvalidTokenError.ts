import { InfrastructureError } from "./InfrastructureError";
import { BaseErrorOptions } from "./BaseError";

export class InvalidTokenError extends InfrastructureError {
  constructor(message = "Token is invalid", options?: BaseErrorOptions) {
    super(message, options);
  }
}
