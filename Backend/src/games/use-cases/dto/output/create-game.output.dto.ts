import { Board } from "src/games/domain/value-objects/board.vo";
import { Stone } from "src/games/domain/value-objects/stone.vo";

export interface CreateGameOutputDto{
    id: string,
    board: Board,
    nextStone: Stone
}
