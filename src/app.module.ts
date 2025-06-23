import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectModule } from './modules/project/project.module';
import { ModuleModule } from './modules/module/module.module';
import { TaskModule } from './modules/task/task.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectModule,
    ModuleModule,
    TaskModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
