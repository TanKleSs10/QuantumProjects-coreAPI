/**
 * Enumerates the roles supported by the application.
 */
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  DEVELOPER = "developer",
  DESIGNER = "designer",
}

/**
 * Properties required to create a {@link User} domain entity.
 */
export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  teamIds?: string[];
  projectIds?: string[];
  notificationIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of an application user.
 */
export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public passwordHash: string;
  public role: UserRole;
  public avatarUrl?: string;
  public bio?: string;
  public teamIds: string[];
  public projectIds: string[];
  public notificationIds: string[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.avatarUrl = props.avatarUrl;
    this.bio = props.bio;
    this.teamIds = props.teamIds ?? [];
    this.projectIds = props.projectIds ?? [];
    this.notificationIds = props.notificationIds ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
