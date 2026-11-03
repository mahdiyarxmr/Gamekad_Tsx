import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './common/jwt.guard';
import { CatalogController } from './catalog/catalog.controller';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { FinanceController } from './finance/finance.controller';
import { SocialController } from './social/social.controller';
import { ContentController } from './content/content.controller';
import { GodGameController } from './god-game/godgame.controller';
import { AdminController } from './admin/admin.controller';
import { SettingsController } from './settings/settings.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [
    CatalogController,
    EventsController,
    FinanceController,
    SocialController,
    ContentController,
    GodGameController,
    AdminController,
    SettingsController,
  ],
  providers: [PrismaService, EventsService, { provide: APP_GUARD, useClass: JwtGuard }],
})
export class AppModule {}
