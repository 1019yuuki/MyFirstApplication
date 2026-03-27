import { Module } from '@nestjs/common';
import { GamesController } from './presentation/controllers/games.controller';
import { PrismaGamesRepository } from './infrastructure/repositories/prisma-games.repository';
import { CreateGameUseCase } from './use-cases/create-game.use-case';
import { UpdateGameUseCase } from './use-cases/update-game.use-case';

@Module({
  controllers: [GamesController],
  providers: [
    CreateGameUseCase,
    UpdateGameUseCase,
    {
      provide: "IGamesRepository",
      useClass: PrismaGamesRepository
    }
  ]
})
export class GamesModule {}

