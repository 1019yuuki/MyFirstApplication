import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CreateGameResponseDto } from './dto/response/create-game.response.dto';
import { type UpdateGameRequestDto } from './dto/request/update-game.request.dto';
import { UpdateGameResponseDto } from './dto/response/update-game.response.dto';
import { CreateGameUseCase } from 'src/games/use-cases/create-game.use-case';
import { UpdateGameUseCase } from 'src/games/use-cases/update-game.use-case';

@Controller('games')
export class GamesController {

    constructor(private createGameUseCase: CreateGameUseCase, private updateGameUseCase: UpdateGameUseCase) { }

    @Post('new_game')
    async CreateGame(): Promise<CreateGameResponseDto> {
        console.log("CreateGame was called.");

        // ゲームを新規作成する
        const game = await this.createGameUseCase.execute();
        console.log("Game was created.")

        // 作成したゲームを返却する
        return {
            board: game.board.grid.map(row => row.map(stone => stone.type)),
            nextStone: game.nextStone.type,
            gameId: game.id
        };
    }

    @Patch(':id')
    async UpdateGameById(@Body() { x, y }: UpdateGameRequestDto, @Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameById was called.");

        // 石を打つ
        const updated = await this.updateGameUseCase.execute({ id, x, y });

        // 更新したゲームを返却する
        return {
            board: updated.board.grid.map(row => row.map(stone => stone.type)),
            nextStone: updated.nextStone.type
        };
    }

    @Patch(':id/cpu')
    async UpdateGameByCpu(@Param("id") id: string): Promise<UpdateGameResponseDto> {
        console.log("UpdateGameByCpu was called.");

        // 石を打つ
        const updated = await this.updateGameUseCase.execute({ id });

        // 更新したゲームを返却する
        return {
            board: updated.board.grid.map(row => row.map(stone => stone.type)),
            nextStone: updated.nextStone.type
        };
    }
}
