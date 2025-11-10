import { InfrastructureError } from "./InfrastructureError";
import { BaseErrorOptions } from "./BaseError";

export class EmailTemplateError extends InfrastructureError {
  constructor(message = "Unable to render email template", options?: BaseErrorOptions) {
    super(message, options);
  }
}
