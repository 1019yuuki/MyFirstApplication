import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { GamesModule } from './games/games.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        GamesModule, 
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        })
    ],
    exports: [AppModule]
})
export class AppModule {}
