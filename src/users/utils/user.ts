import { Role, UserStatus } from '../entities/user.entity';

export class ShortUserResponse {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  user_id: string;
  constructor({ name, email, role, status, user_id }) {
    this.user_id = user_id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.status = status;
  }
}
