import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { GamesUseCase } from '../../use-cases/games.use-case';
import { Board } from 'src/games/domain/entities/board.model';

@Controller('games')
export class GamesController {

    constructor(private gamesService: GamesUseCase) { }

    @Post('new_game')
    async CreateGame(): Promise<CreateGameResponseDto> {
        console.log("CreateGame was called.");

        // ゲームを新規作成する
        const game = await this.gamesService.createGame();
        console.log("Game was created.")

        // 作成したゲームを返却する
        return { board: boardToStoneType(game.board), nextStone: game.nextStone.stoneType, gameId: game.id };
    }

    @Patch(':id')
    async UpdateGameById(@Body() dto: UpdateGameByIdRequestDto, @Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameById was called.");

        // 石を打つ
        const updated = await this.gamesService.updateGameById(id, dto.x, dto.y);

        // 更新したゲームを返却する
        return { board: boardToStoneType(updated.board), nextStone: updated.nextStone.stoneType };
    }

    @Patch(':id/cpu')
    async UpdateGameByCpu(@Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameByCpu was called.");

        // 石を打つ
        const updated = await this.gamesService.updateGameByCpu(id);

        // 更新したゲームを返却する
        return { board: boardToStoneType(updated.board), nextStone: updated.nextStone.stoneType };

    }
}

interface UpdateGameByIdRequestDto {
    x: number,
    y: number
}

interface UpdateGameResponseDto {
    board: DtoStoneType[][],
    nextStone: DtoStoneType
}

interface CreateGameResponseDto {
    board: DtoStoneType[][],
    nextStone: DtoStoneType,
    gameId: string
}

type DtoStoneType = "BLACK" | "WHITE" | "NONE"

const boardToStoneType = (board: Board): DtoStoneType[][] => {
    return board.grid.map((row) => {
        return [...(row.map((stone) => stone.stoneType))];
    })
}