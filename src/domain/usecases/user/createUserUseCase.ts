import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { IEmailService } from "@src/domain/services/IEmailService";
import { ISecurityService } from "@src/domain/services/ISecurityService";

export interface ICreateUserUseCase {
  excecute(userData: CreateUserDTO): Promise<User>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
  ) {}

  async excecute(userData: CreateUserDTO): Promise<User> {
    // password hashing
    const passwordHashed = await this.securityService.hashPassword(
      userData.password,
    );

    const userDataWithHashedPassword = {
      ...userData,
      passwordHash: passwordHashed,
    };

    const user = await this.userRepository.createUser(userDataWithHashedPassword);

    const verificationToken = await this.securityService.generateToken(
      { id: user.id, email: user.email },
      "1h",
    );
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }
}
