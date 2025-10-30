import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";

/**
 * Fields allowed to be updated on an existing user.
 */
export type UpdateUserData = Partial<Omit<CreateUserDTO, "password" | "teamIds" | "projectIds" | "notificationIds">> & {
  password?: string;
  teamIds?: string[];
  projectIds?: string[];
  notificationIds?: string[];
};

/**
 * Contract that must be implemented by any persistence mechanism handling users.
 */
export interface IUserRepository {
  /**
   * Persists a new user and returns the created domain entity.
   */
  create(data: CreateUserDTO): Promise<User>;

  /**
   * Retrieves a user by its identifier.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Retrieves a user by email if it exists.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Lists all users registered in the workspace.
   */
  list(): Promise<User[]>;

  /**
   * Updates an existing user and returns the new persisted state.
   */
  update(id: string, updates: UpdateUserData): Promise<User | null>;

  /**
   * Removes a user from the persistence layer.
   */
  delete(id: string): Promise<boolean>;
}
