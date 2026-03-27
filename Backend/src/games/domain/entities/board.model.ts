import { BadRequestException } from "@nestjs/common";
import { SentinelStone, Stone } from "./stone.model";

export class Board {
    constructor(private _grid: Stone[][]) { }

    getStone(x: number, y: number): Stone {
        return this._grid[y][x];
    }

    get grid() {
        return this._grid;
    }

    static getInitialBoard(): Board {
        return new Board(initBoard);
    }

    putStone(x: number, y: number, Stone: Stone) {
        this._grid[y][x] = Stone;
    }

    canPutStone(target: Stone): boolean {
        return this._grid.some((row, y) => {
            return row.some((_, x) => {
                if (this.getStone(x, y).stoneType !== "NONE") {
                    return false;
                }
                return this.getFlipPoints(x, y, target).length > 0;
            })
        });
    }

    getFlipPoints(x: number, y: number, currentStone: Stone): Cell[] {

        if (this.getStone(x, y).stoneType !== "NONE"){
            throw new BadRequestException("another stone was already put.");
        }

        const directions: Cell[] = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: 0 }
        ]

        // boardに番兵を追加する
        const sentinelBoard = new SentinelBoard(this);

        // 番兵に合わせて番地をずらす
        const sentinelX = x + 1;
        const sentinelY = y + 1;

        const flipPoints: Cell[] = [];

        // 各方向へ探索する
        directions.forEach((direction) => {
            let workX = sentinelX + direction.x;
            let workY = sentinelY + direction.y;
            const workFlipPoints: Cell[] = [];

            // 隣のセルが相手の石でなければ処理を終了する
            if (sentinelBoard.getStone(workX, workY).stoneType !== currentStone.reverseStone.stoneType) {
                return;
            }

            // 相手の石以外が出るまで各方向へ処理を進める
            while (sentinelBoard.getStone(workX, workY).stoneType === currentStone.reverseStone.stoneType) {
                workFlipPoints.push({ x: workX, y: workY });
                workX = workX + direction.x;
                workY = workY + direction.y;
            }

            // 対向先が自分の石であればflipPointsに通過した石を追加する
            if (sentinelBoard.getStone(workX, workY).stoneType === currentStone.stoneType) {
                workFlipPoints.forEach((flipPoint) => { flipPoints.push(flipPoint); })
            }
        })

        // 番兵分の番地をずらす
        return flipPoints.map((flipPoint) => ({ x: flipPoint.x - 1, y: flipPoint.y - 1 }));
    }
}

class SentinelBoard {
    private _grid: SentinelStone[][]

    constructor(_board: Board) {
        this._grid = [];
        const sentinelRow: SentinelStone[] = [SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall(), SentinelStone.wall()];

        this._grid.push(sentinelRow);

        _board.grid.forEach((row) => {
            this._grid.push([SentinelStone.wall(), ...(row.map((cell) => new SentinelStone(cell.stoneType))), SentinelStone.wall()]);
        });

        this._grid.push(sentinelRow);
    }

    getStone(x: number, y: number): SentinelStone {
        return this._grid[y][x];
    }
}

export interface Cell {
    x: number,
    y: number
}

const initBoard: Stone[][] = [
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.white(), Stone.black(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.black(), Stone.white(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()]
]