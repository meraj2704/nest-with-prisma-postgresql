import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Shape attached to request.user by JwtStrategy.validate */
export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  departmentId: number;
}

export const GetUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user: AuthUser | undefined = ctx.switchToHttp().getRequest().user;
    if (data) {
      return user ? user[data] : undefined;
    }
    return user;
  },
);
