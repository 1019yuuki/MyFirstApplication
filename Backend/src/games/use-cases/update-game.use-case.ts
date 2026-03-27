import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { type IGamesRepository } from "../domain/repositories/games.repository.interface"
import { Game } from "../domain/entities/game.entity"
import { UpdateGameOutputDto } from "./dto/output/update-game.output.dto";
import { UpdateGameInputDto } from "./dto/input/update-game.input.dto";
import { Cell } from "../domain/value-objects/cell.vo";

@Injectable()
export class UpdateGameUseCase {
    constructor(@Inject('IGamesRepository') private repository: IGamesRepository) { }

    async execute({ id, x, y }: UpdateGameInputDto): Promise<UpdateGameOutputDto> {

        // 盤面を取得する
        const game = await this.repository.findById(id);

        // 石を打つ座標が未決定の場合は座標を決定する
        const cell: Cell = (x === undefined || y === undefined) ? game.getCpuPlaceCell() : Cell.create({ x, y });

        // 石を打つ
        game.placeStone(cell);

        // ターンを更新する
        game.next();

        // データを更新する
        const updated = await this.repository.update(game);

        // 更新したゲーム情報を返却する
        return updated;
    }
}