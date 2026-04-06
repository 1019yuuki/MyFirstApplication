import { Module } from '@nestjs/common';
import { GamesController } from './presentation/controllers/games.controller';
import { PrismaGamesRepository } from './infrastructure/repositories/prisma-games.repository';
import { CreateGameUseCase } from './use-cases/create-game.use-case';
import { UpdateGameUseCase } from './use-cases/update-game.use-case';
import { CustomAiService } from './infrastructure/ai/custom-ai.service';
import { CpuStrategyService } from './domain/services/cpu-strategy.service';

@Module({
  controllers: [GamesController],
  providers: [
    CreateGameUseCase,
    UpdateGameUseCase,
    CpuStrategyService,
    {
      provide: "IAiService",
      useClass: CustomAiService
    },
    {
      provide: "IGamesRepository",
      useClass: PrismaGamesRepository
    }
  ]
})
export class GamesModule {}

