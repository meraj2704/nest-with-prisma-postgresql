import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { Validator } from '../../../src/common/validation/validator.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService, Validator],
})
export class DashboardModule {}
