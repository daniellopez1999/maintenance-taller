import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDatabaseProviders } from './databaseProvider';
import { UsersEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), usersDatabaseProviders],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
