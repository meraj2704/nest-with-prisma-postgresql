import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller.js';
import { ProjectRepository } from './project.repository.js';
import { ProjectService } from './project.service.js';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectRepository],
})
export class ProjectModule {}
