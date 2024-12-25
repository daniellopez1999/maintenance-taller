import { Role, UserStatus } from '../entities/user.entity';

export class ShortUserResponse {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  constructor({ name, email, role, status }) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.status = status;
  }
}
