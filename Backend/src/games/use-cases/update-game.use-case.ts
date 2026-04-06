import { Inject, Injectable } from "@nestjs/common"
import { type IGamesRepository } from "../domain/repositories/games.repository.interface"
import { UpdateGameOutputDto } from "./dto/output/update-game.output.dto";
import { UpdateGameInputDto } from "./dto/input/update-game.input.dto";
import { Cell } from "../domain/value-objects/cell.vo";
import { CpuStrategyService } from "../domain/services/cpu-strategy.service";


@Injectable()
export class UpdateGameUseCase {
    constructor(@Inject('IGamesRepository') private repository: IGamesRepository, private cpuStrategy: CpuStrategyService) { }

    async execute({ id, x, y }: UpdateGameInputDto): Promise<UpdateGameOutputDto> {

        // 盤面を取得する
        const game = await this.repository.findById(id);

        // 座標が未決定の場合は座標を決定させる
        if (x === undefined || y === undefined){
            ({ x, y } = await this.cpuStrategy.predict(game));
        }

        // 石を打つ
        game.placeStone(Cell.create({ x, y }));

        // ターンを更新する
        game.next();

        // データを更新する
        const updated = await this.repository.update(game);

        // 更新したゲーム情報を返却する
        return updated;
    }
}