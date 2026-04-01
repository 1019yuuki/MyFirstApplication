import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GamesModule } from './games/games.module';
import { ConfigModule } from '@nestjs/config';
import { ReversiAiModule } from './reversi-ai/reversi-ai.module';

@Module({
    imports: [
        GamesModule, 
        PrismaModule,
        ReversiAiModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        })
    ],
    exports: [AppModule]
})
export class AppModule {}
