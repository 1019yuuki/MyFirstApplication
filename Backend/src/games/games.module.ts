import { Module } from '@nestjs/common';
import { GamesController } from './presentation/controllers/games.controller';
import { GamesUseCase } from './use-cases/games.use-case';
import { PrismaGamesRepository } from './infrastructure/repositories/prisma-games.repository';

@Module({
  controllers: [GamesController],
  providers: [
    GamesUseCase,
    {
      provide: "IGamesRepository",
      useClass: PrismaGamesRepository
    }
  ]
})
export class GamesModule {}

