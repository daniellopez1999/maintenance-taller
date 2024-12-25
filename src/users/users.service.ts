import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { confirmPassword, email, password, name, role } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password must be the same',
      );
    }

    const emailFound = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (emailFound) {
      throw new ConflictException('This email has been already used ');
    }

    const user = this.usersRepository.create({
      email: email,
      name: name,
      password: password,
      role: role,
    });
    return await this.usersRepository.save(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
