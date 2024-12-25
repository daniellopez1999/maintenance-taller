import { envs } from 'src/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';

export const usersDatabaseProviders = TypeOrmModule.forRoot({
  type: 'postgres',
  host: envs.DATABASE_USERS_HOST,
  port: envs.DATABASE_USERS_PORT,
  username: envs.DATABASE_USERS_USERNAME,
  password: envs.DATABASE_USERS_PASSWORD,
  database: envs.DATABASE_USERS_NAME,
  entities: [UsersEntity],
  synchronize: false,
});
