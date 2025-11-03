import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";

export interface ICreateUserUseCase {
  excecute(userData: CreateUserDTO): Promise<User>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
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

    return this.userRepository.createUser(userDataWithHashedPassword);
  }
}
