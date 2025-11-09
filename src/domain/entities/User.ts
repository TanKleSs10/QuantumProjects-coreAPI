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
  password: string;
  role: UserRole;
  isVerefied: boolean;
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
  public password: string;
  public role: UserRole;
  public isVerefied: boolean = false;
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
    this.password = props.password;
    this.role = props.role;
    this.avatarUrl = props.avatarUrl;
    this.bio = props.bio;
    this.isVerefied = props.isVerefied;
    this.teamIds = props.teamIds ?? [];
    this.projectIds = props.projectIds ?? [];
    this.notificationIds = props.notificationIds ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static fromObject(obj: any): User {
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid object: expected a non-null object");
    }

    // Normalizar campos desde Mongo/Typegoose
    const normalized = {
      id: obj._id?.toString?.() ?? obj.id,
      name: obj.name,
      email: obj.email,
      password: obj.password, // 👈 aceptar ambas
      role: obj.role,
      avatarUrl: obj.avatarUrl,
      bio: obj.bio,
      isVerefied: obj.isVerefied ?? false,
      teamIds: obj.teamIds ?? obj.teams ?? [],
      projectIds: obj.projectIds ?? obj.projects ?? [],
      notificationIds: obj.notificationIds ?? obj.notifications ?? [],
      createdAt: obj.createdAt ? new Date(obj.createdAt) : new Date(),
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt) : new Date(),
    };

    // Validaciones básicas
    if (!normalized.id) throw new Error("Missing or invalid 'id'");
    if (!normalized.name) throw new Error("Missing or invalid 'name'");
    if (!normalized.email) throw new Error("Missing or invalid 'email'");
    if (!normalized.password)
      throw new Error("Missing or invalid 'passwordHash'");
    if (!Object.values(UserRole).includes(normalized.role))
      throw new Error(`Invalid or missing 'role': ${normalized.role}`);

    return new User(normalized);
  }
}
