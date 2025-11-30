import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { UserDatasource } from "@src/infrastructure/datasources/UserDatasource";
import { UserRepository } from "@src/infrastructure/repositories/UserRepository";

const userDatasource = new UserDatasource();

export const userRepository: IUserRepository = new UserRepository(userDatasource);
