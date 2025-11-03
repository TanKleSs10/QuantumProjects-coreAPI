import { Request, Response } from "express";
import { ILogger } from "@src/interfaces/Logger";
import { CreateUserSchema } from "@src/domain/dtos/CreateUserDTO";
import { CreateUserUseCase } from "@src/domain/usecases/user/createUserUseCase";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { IEmailService } from "@src/domain/services/IEmailService";

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}

  createUser = (req: Request, res: Response) => {
    const userData = CreateUserSchema.parse(req.body);
    if (!userData) {
      this.logger.error("Invalid user data");
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
    new CreateUserUseCase(
      this.userRepository,
      this.securityService,
      this.emailService,
    )
      .excecute(userData)
      .then((user) => {
        res
          .status(201)
          .json({ success: true, message: "user created success", data: user });
      })
      .catch((error) => {
        this.logger.error("Error creating user", error);
        res.status(400).json({ success: false, message: error.message });
      });
  };
}
