import { Request, Response } from "express";
import { ILogger } from "@src/interfaces/Logger";
import { CreateUserSchema } from "@src/domain/dtos/CreateUserDTO";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { IEmailService } from "@src/domain/services/IEmailService";
import { GetAllUsersUseCase } from "@src/application/usecases/user/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "@src/application/usecases/user/GetUserByIdUseCase";
import { GetUserByEmailUseCase } from "@src/application/usecases/user/GetUserByEmailUseCase";
import { CreateUserUseCase } from "@src/application/usecases/user/CreateUserUseCase";
import { UpdateUserSchema } from "@src/domain/dtos/UpdateUserDTO";
import { DeleteUserUseCase } from "@src/application/usecases/user/DeleteUserUseCase";
import { UpdateUserUseCase } from "@src/application/usecases/user/UpdateUserUseCase";

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}

  createUser = (req: Request, res: Response) => {
    const userData = CreateUserSchema.safeParse(req.body);
    if (!userData.success) {
      this.logger.error("Invalid user data");
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }
    new CreateUserUseCase(
      this.userRepository,
      this.securityService,
      this.emailService,
    )
      .excecute(userData.data!)
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

  getUserById = (req: Request, res: Response) => {
    const userId = req.params.id;
    new GetUserByIdUseCase(this.userRepository, this.logger)
      .execute(userId)
      .then((user) => {
        res.status(200).json({ success: true, data: user });
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: error.message });
      });
  };

  getUserByEmail = (req: Request, res: Response) => {
    const email = req.params.email;
    if (!email) {
      this.logger.error("Email is required");
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    new GetUserByEmailUseCase(this.userRepository, this.logger)
      .execute(email)
      .then((user) => {
        res.status(200).json({ success: true, data: user });
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: error.message });
      });
  };

  getAllUsers = (_req: Request, res: Response) => {
    new GetAllUsersUseCase(this.userRepository, this.logger)
      .execute()
      .then((users) => {
        res.status(200).json({ success: true, data: users });
      })
      .catch((error) => {
        this.logger.error("Error fetching users", error);
        res.status(500).json({ success: false, message: error.message });
      });
  };

  updateUser = (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      this.logger.error("User ID is required");
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const updateData = UpdateUserSchema.safeParse(req.body);

    if (!updateData.success) {
      this.logger.error("Invalid update data");
      return res
        .status(400)
        .json({ success: false, message: "Invalid update data" });
    }

    new UpdateUserUseCase(this.userRepository, this.securityService)
      .execute(userId, updateData.data!)
      .then((user) => {
        res.status(200).json({ success: true, data: user });
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: error.message });
      });
  };

  deleteUser = (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    new DeleteUserUseCase(this.userRepository, this.logger)
      .execute(userId)
      .then(() => {
        res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      })
      .catch((error) => {
        this.logger.error("Error deleting user", error);
        res.status(500).json({ success: false, message: error.message });
      });
  };
}
