import { IUserDatasource } from "@src/domain/datasources/IUserDatasource";

export class UserRepository implements IUserDatasource {
  constructor(private readonly userDatasource: IUserDatasource) {}
  createUser(userData: CreateUserDTO): Promise<User> {}
  getUserById(id: string): Promise<User> {}
  getAllUsers(): Promise<User[]> {}
  updateUser(
    userId: string,
    updateData: Partial<CreateUserDTO>,
  ): Promise<User> {}
  deleteUser(id: string): Promise<boolean> {}
}
