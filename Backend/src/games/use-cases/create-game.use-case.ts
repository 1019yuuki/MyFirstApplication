import { Inject, Injectable } from "@nestjs/common"
import { type IGamesRepository } from "../domain/repositories/games.repository.interface"
import { Game } from "../domain/entities/game.entity"
import { CreateGameOutputDto } from "./dto/output/create-game.output.dto";

@Injectable()
export class CreateGameUseCase {
    constructor(@Inject('IGamesRepository') private repository: IGamesRepository) { }

    async execute(): Promise<CreateGameOutputDto> {

        // ゲームの新規作成
        const { id, board, nextStone} = await this.repository.create();

        return {
            id,
            board,
            nextStone
        };
    }
}