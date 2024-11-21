import { Module } from '@nestjs/common';

import { AuthenticationGuard } from './authentication.guard';
import { AuthService } from './auth.service';

@Module({
    providers: [
        AuthenticationGuard,
        AuthService,
    ],
    exports: [
        AuthService,
    ],
})
export class AuthModule {}