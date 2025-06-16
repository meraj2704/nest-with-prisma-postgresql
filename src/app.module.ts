import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectModule } from './project/project.module';
import { ModuleModule } from './module/module.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProjectModule, ModuleModule, TaskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
