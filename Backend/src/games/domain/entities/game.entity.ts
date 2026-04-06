import { BadRequestException } from "@nestjs/common"
import { Board } from "../value-objects/board.vo"
import { Cell } from "../value-objects/cell.vo"
import { Stone } from "../value-objects/stone.vo"

export class Game {

    constructor(private readonly _game: { readonly id: string, board: Board, nextStone: Stone, turn: number, version: number }) { }

    get id(): string {
        return this._game.id
    }

    get board(): Board {
        return this._game.board
    }

    get nextStone(): Stone {
        return this._game.nextStone
    }

    get turn(): number {
        return this._game.turn
    }

    get version(): number {
        return this._game.version
    }

    placeStone(cell: Cell): void {
        // 盤面を更新する
        this._game.board = this.board.placeStone(this._game.nextStone, cell);
    }

    next(): void {
        // 次のターンを取得しnextStoneを更新する
        let nextStone: Stone = Stone.none();

        if (this._game.board.canPlaceStone(this._game.nextStone.reverseStone)) {
            nextStone = this._game.nextStone.reverseStone;
        }
        else if (this._game.board.canPlaceStone(this._game.nextStone)) {
            nextStone = this._game.nextStone;
        }

        this._game.nextStone = nextStone;
        this._game.turn++;
    }

    getCpuPlaceCell(): Cell {

        // 石が打てる箇所を取得する
        const putablePoints: Cell[] = this._game.board.getputablePoints(this._game.nextStone);

        // 石を打つ場所をランダムで決める
        let putIndex = Math.floor(Math.random() * putablePoints.length);
        if (putIndex === putablePoints.length) {
            putIndex = putablePoints.length - 1;
        }

        // 決定したセルを返却する
        return putablePoints[putIndex];
    }
}
