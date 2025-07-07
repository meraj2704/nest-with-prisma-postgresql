import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { Validator } from 'src/common/validation/validator.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, Validator],
})
export class UsersModule {}
