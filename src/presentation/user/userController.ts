import { Request, Response } from "express";
import { ILogger } from "@src/interfaces/Logger";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { GetAllUsersUseCase } from "@src/application/usecases/user/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "@src/application/usecases/user/GetUserByIdUseCase";
import { GetUserByEmailUseCase } from "@src/application/usecases/user/GetUserByEmailUseCase";
import { UpdateUserSchema } from "@src/domain/dtos/UpdateUserDTO";
import { DeleteUserUseCase } from "@src/application/usecases/user/DeleteUserUseCase";
import { UpdateUserUseCase } from "@src/application/usecases/user/UpdateUserUseCase";
import { ChangePassSchema } from "@src/domain/dtos/ChangePassDTO";
import { ChangePassUseCase } from "@src/application/usecases/user/ChangePassUseCase";

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly logger: ILogger,
  ) {}

  getUserById = (req: Request, res: Response) => {
    const userId = req.userId ? req.userId : null;
    if (!userId) {
      this.logger.error("User ID is required");
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

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
    const userId = req.userId ? req.userId : null;
    if (!userId) {
      this.logger.error("Unauthorized: No user ID found in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

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

  changePassword = (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      this.logger.error("Unauthorized: No user ID found in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    const parsed = ChangePassSchema.safeParse({
      userId,
      currentPassword,
      newPassword,
    });

    if (!parsed.success) {
      this.logger.error("Invalid change password data", {
        issues: parsed.error.message,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid change password data",
        errors: parsed.error.message,
      });
    }

    new ChangePassUseCase(
      this.userRepository,
      this.securityService,
      this.logger,
    )
      .execute(parsed.data)
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Password changed successfully",
        });
      })
      .catch((error) => {
        this.logger.error("Error changing password", error);
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
