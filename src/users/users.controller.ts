import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('confirm-password')
  confirmPassword(@Body() confirmPasswordDto: ConfirmPasswordDto) {
    return this.usersService.confirmPassword(confirmPasswordDto);
  }

  @Post('resend-email')
  resendConfirmationPassword(@Body() user_id: string) {
    return this.usersService.resendConfirmationPassword(user_id);
  }
}
