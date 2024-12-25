import 'dotenv/config';
import * as joi from 'joi';
interface EnvVars {
  PORT: number;
  DATABASE_USERS_NAME: string;
  DATABASE_USERS_USERNAME: string;
  DATABASE_USERS_PASSWORD: string;
  DATABASE_USERS_HOST: string;
  DATABASE_USERS_PORT: number;
  SECRET_KEY: string;
  FRONTEND_URL: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  DATABASE_USERS_NAME: joi.string().required(),
  DATABASE_USERS_USERNAME: joi.string().required(),
  DATABASE_USERS_PASSWORD: joi.string().required(),
  DATABASE_USERS_HOST: joi.string().required(),
  DATABASE_USERS_PORT: joi.number().required(),
  SECRET_KEY: joi.string().required(),
  FRONTEND_URL: joi.string().required(),
});

const { error, value } = envsSchema.validate(process.env, {
  allowUnknown: true,
});

if (error) {
  throw new Error(`Config Validation Error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  DATABASE_USERS_NAME: envVars.DATABASE_USERS_NAME,
  DATABASE_USERS_USERNAME: envVars.DATABASE_USERS_USERNAME,
  DATABASE_USERS_PASSWORD: envVars.DATABASE_USERS_PASSWORD,
  DATABASE_USERS_HOST: envVars.DATABASE_USERS_HOST,
  DATABASE_USERS_PORT: envVars.DATABASE_USERS_PORT,
  SECRET_KEY: envVars.SECRET_KEY,
  FRONTEND_URL: envVars.FRONTEND_URL,
};
