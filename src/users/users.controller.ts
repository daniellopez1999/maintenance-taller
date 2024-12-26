import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { log } from 'console';

const logger = new Logger(UsersService.name);
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  async create(@Payload() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('confirm-password')
  confirmPassword(@Body() confirmPasswordDto: ConfirmPasswordDto) {
    return this.usersService.confirmPassword(confirmPasswordDto);
  }

  @Post('resend-email')
  resendConfirmationPassword(@Body() user_id: string) {
    return this.usersService.resendConfirmationPassword(user_id);
  }

  @MessagePattern({ cmd: 'get-user' })
  findUserById(@Payload() user_id: string) {
    return this.usersService.findUserById(user_id);
  }

  @MessagePattern({ cmd: 'get-users' })
  findUsers(@Payload() getUsersDTO: GetUsersDto) {
    logger.log(getUsersDTO);
    return this.usersService.findUsers(getUsersDTO);
  }
}
