import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class TeamLeadGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext) {
    const auth = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    return (
      auth &&
      (request.user?.role === 'teamLead' || request.user?.role === 'manager')
    );
  }
}
