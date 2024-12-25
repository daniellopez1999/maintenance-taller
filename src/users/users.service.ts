import { envs } from 'src/config';
import {
  decryptToken,
  encryptToken,
  generateUrlWithEncryptedToken,
} from './utilts';
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, getConnection, DataSource } from 'typeorm';
import { UsersEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

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
      return { savedUser, temporalURL };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating user', error.stack);
      throw error;
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
        throw new BadRequestException(
          'Password and Confirm Password must be the same',
        );
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
        throw new NotFoundException('User not found');
      }

      if (user.status !== UserStatus.REGISTERING) {
        throw new BadRequestException('User already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.status = UserStatus.REGISTERED;

      const updatedUser = await queryRunner.manager.save(UsersEntity, user);

      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error confirming password', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async resendConfirmationPassword(user_id: string) {
    try {
      const temporalURL = generateUrlWithEncryptedToken(user_id);
      return temporalURL;
    } catch (error) {
      this.logger.error('Error resending confirmation password', error.stack);
      throw error;
    }
  }
}
