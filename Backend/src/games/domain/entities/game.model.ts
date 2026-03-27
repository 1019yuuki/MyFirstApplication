import { Board } from "./board.model"
import { Stone } from "./stone.model"

export class Game {

    constructor(private readonly _game: GameProps) { }

    get id() {
        return this._game.id
    }

    get board() {
        return this._game.board
    }

    get nextStone() {
        return this._game.nextStone
    }

    get version() {
        return this._game.version
    }

    putStone(x: number, y: number): void {
        this._game.board.putStone(x, y, this._game.nextStone);
    }

    updateNextStone(): void {
        let nextStone: Stone = Stone.none();

        if (this._game.board.canPutStone(this._game.nextStone.reverseStone)) {
            nextStone = this._game.nextStone.reverseStone;
        }
        else if (this._game.board.canPutStone(this._game.nextStone)) {
            nextStone = this._game.nextStone;
        }

        this._game.nextStone = nextStone;
    }
}

interface GameProps {
    id: string,
    board: Board,
    nextStone: Stone,
    version: number
}
