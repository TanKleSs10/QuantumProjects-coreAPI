import { InfrastructureError } from "./InfrastructureError";
import { BaseErrorOptions } from "./BaseError";

export class EmailSendingError extends InfrastructureError {
  constructor(message = "Failed to send email", options?: BaseErrorOptions) {
    super(message, options);
  }
}
