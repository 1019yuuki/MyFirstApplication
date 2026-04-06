import { Injectable } from "@nestjs/common";
import { IAiEngine } from "src/games/domain/interfaces/ai-engine.interface";
import { Board } from "src/games/domain/value-objects/board.vo";
import { ReversiAiService } from "src/reversi-ai/reversi-ai.service";
import { Cell } from "src/games/domain/value-objects/cell.vo";
import { AiEvaluationResult } from "src/games/domain/interfaces/ai-evaluation.result";
import { Stone } from "src/games/domain/value-objects/stone.vo";

@Injectable()
export class CustomAiService implements IAiEngine {

    constructor(private reversiAi: ReversiAiService) { }

    async predict(board: Board, stone: Stone, turn: number, puttablePoints: Cell[]): Promise<AiEvaluationResult> {

        const numericGrid = board.numericGrid;
        const nextPlayer = stone.toNumber();

        // 次のターンをAIに予測させる
        const result = await this.reversiAi.predict(numericGrid, nextPlayer, turn, puttablePoints);

        // 予測結果を返却する
        return result;
    }
}