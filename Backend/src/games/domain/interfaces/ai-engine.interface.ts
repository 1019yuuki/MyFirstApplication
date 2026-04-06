import { Board } from "../value-objects/board.vo";
import { Cell } from "../value-objects/cell.vo";
import { Stone } from "../value-objects/stone.vo";
import { AiEvaluationResult } from "./ai-evaluation.result";

export interface IAiEngine{
    predict(board: Board, stone: Stone, turn: number, puttablePoint: Cell[]): Promise<AiEvaluationResult>
}