import { envs } from 'src/config';
import {
  decryptToken,
  encryptToken,
  generateUrlWithEncryptedToken,
} from './utils/utilts';
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, getConnection, DataSource } from 'typeorm';
import { UsersEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserDto } from './dto/login.dto';
import { ShortUserResponse } from './utils/user';
import * as CONFIG_FILE from './config.json';
import { GetUsersDto } from './dto/get-users.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, name, role } = createUserDto;

      const emailFound = await this.usersRepository.findOne({
        where: { email: email },
      });

      if (emailFound) {
        throw new ConflictException('This email has been already used ');
      }

      const user = this.usersRepository.create({
        email: email,
        name: name,
        password: null,
        role: role,
        status: UserStatus.REGISTERING,
      });

      const savedUser = await queryRunner.manager.save(UsersEntity, user);

      const temporalURL = generateUrlWithEncryptedToken(savedUser.user_id);

      await queryRunner.commitTransaction();

      //TODO: Send email with temporalURL

      return { savedUser, temporalURL };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Error creating user',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async confirmPassword(confirmPasswordDto: ConfirmPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { password, confirmPassword, token } = confirmPasswordDto;
      if (password !== confirmPassword) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Password and Confirm Password must be the same',
        });
      }

      const decryptedToken = decryptToken(token);

      let decoded;
      try {
        decoded = jwt.verify(decryptedToken, envs.SECRET_KEY);
      } catch (err) {
        throw new BadRequestException('Invalid or expired token');
      }

      const user = await this.usersRepository.findOne({
        where: { user_id: decoded.userId },
      });
      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      if (user.status !== UserStatus.REGISTERING) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'User already registered',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.status = UserStatus.REGISTERED;

      const updatedUser = await queryRunner.manager.save(UsersEntity, user);

      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error confirming password',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async resendConfirmationPassword(user_id: string) {
    const temporalURL = generateUrlWithEncryptedToken(user_id);
    return temporalURL;
  }

  async findUsers(getUsersDTO: GetUsersDto) {
    const { search, limit, page } = getUsersDTO;

    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where('user.name LIKE :search OR user.email LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.take(limit);
    queryBuilder.skip(skip);

    const users = await queryBuilder.getMany();

    const usersMapped = users.map((user) => new ShortUserResponse(user));
    return usersMapped;
  }

  async findUserById(user_id: string) {
    const user = await this.usersRepository.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new RpcException({
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const userInstance = new ShortUserResponse(user);

    return userInstance;
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Credentials',
      });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      envs.SECRET_KEY,
      { expiresIn: CONFIG_FILE.LOGIN_EXPIRATION_TIME },
    );

    const userInstance = new ShortUserResponse(user);

    return { token, userInstance };
  }
}
