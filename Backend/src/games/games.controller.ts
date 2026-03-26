import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('games')
export class GamesController {

    constructor(private gamesService: GamesService) { }

    @Post('new_game')
    async CreateGame(): Promise<CreateGameResponseDto> {
        console.log("CreateGame was called.");

        // ゲームを新規作成する
        const game = await this.gamesService.CreateGame();
        console.log("Game was created.")

        // 作成したゲームを返却する
        return { board: game.board, nextStone: game.nextStone, gameId: game.id };
    }

    @Patch(':id')
    async UpdateGameById(@Body() dto: UpdateGameByIdRequestDto, @Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameById was called.");

        // 石を打つ
        const updated = await this.gamesService.UpdateGameById(id, dto.x, dto.y, dto.currentStone);

        // 更新したゲームを返却する
        return { board: updated.board, nextStone: updated.nextStone };
    }

    @Patch(':id/cpu')
    async UpdateGameByCpu(@Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameByCpu was called.");

        // 石を打つ
        const updated = await this.gamesService.UpdateGameByCpu(id);

        // 更新したゲームを返却する
        return { board: updated.board, nextStone: updated.nextStone };

    }
}

type StoneType = "BLACK" | "WHITE" | "NONE"

interface UpdateGameByIdRequestDto {
    x: number,
    y: number,
    currentStone: StoneType
}

interface UpdateGameResponseDto {
    board: StoneType[][],
    nextStone: StoneType
}

interface CreateGameResponseDto {
    board: StoneType[][],
    nextStone: StoneType,
    gameId: string
}
