import { BadRequestException } from "@nestjs/common";
import { Stone } from "./stone.vo";
import { Cell } from "./cell.vo";

export class Board {
    private constructor(private readonly _grid: readonly (readonly Stone[])[]) { }

    static create(grid: Stone[][] = initGrid): Board {
        const sentinel = Board.addSentinel(grid);
        return new Board(sentinel);
    }

    static getInitialBoard() {
        return Board.create();
    }

    get grid(): Stone[][] {
        return this.removeSentinel();
    }

    get numericGrid(): number[][]{
        return this.grid.map(row => row.map(stone => stone.toNumber()))
    }

    private static addSentinel(grid: Stone[][]): Stone[][] {
        const sentinelGrid: Stone[][] = [];
        const sentinelRow: Stone[] = [Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall(), Stone.wall()];

        sentinelGrid.push(sentinelRow);

        grid.forEach((row) => {
            sentinelGrid.push([Stone.wall(), ...row, Stone.wall()]);
        });

        sentinelGrid.push(sentinelRow);

        return sentinelGrid;
    }

    private removeSentinel(): Stone[][] {
        return this._grid.map(row => row.slice(1, -1)).slice(1, -1);
    }

    getStone(cell: Cell): Stone {
        const internalCell = cell.internal;
        return this._grid[internalCell.y][internalCell.x];
    }

    private updateBoard(stone: Stone, ...cells: Cell[]): Board {
        const grid: Stone[][] = this._grid.map(row => [...row]);

        cells.map(cell => {
            const internalCell = cell.internal;
            grid[internalCell.y][internalCell.x] = stone;
        });

        return new Board(grid);
    }

    placeStone(stone: Stone, cell: Cell): Board {

        // 石が打てるか確認する
        const flipPoints = this.getFlipPoints(cell, stone);

        if (flipPoints.length === 0) {
            throw new BadRequestException("No Stone can reverce.");
        }

        // 石を打つ
        return this.updateBoard(stone, cell, ...flipPoints);
    }

    getputablePoints(stone: Stone): Cell[] {
        const putablePoints: Cell[] = [];

        this.grid.forEach((row, y) => {
            row.forEach((_, x) => {

                const cell = Cell.create({ x, y });

                const workStone = this.getStone(cell);

                if (workStone.isEmpty() && this.getFlipPoints(cell, stone).length > 0) {
                    putablePoints.push(cell);
                }
            })
        });

        return putablePoints;
    }

    canPlaceStone(target: Stone): boolean {
        return this.grid.some((row, y) => {
            return row.some((_, x) => {

                const cell = Cell.create({ x, y });

                if (!this.getStone(cell).isEmpty()) {
                    return false;
                }
                return this.getFlipPoints(cell, target).length > 0;
            })
        });
    }

    getFlipPoints(cell: Cell, currentStone: Stone): Cell[] {

        if (!this.getStone(cell).isEmpty()) {
            throw new BadRequestException("Another stone was already placed.");
        }

        const directions: { x: number, y: number }[] = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: 0 }
        ]

        const flipPoints: Cell[] = [];

        // 各方向へ探索する
        directions.forEach((direction) => {
            let workCell = cell.move(direction);
            const workFlipPoints: Cell[] = [];

            // 隣のセルが相手の石でなければ処理を終了する
            if (!this.getStone(workCell).equal(currentStone.reverseStone)) {
                return;
            }

            // 相手の石以外が出るまで各方向へ処理を進める
            while (this.getStone(workCell).equal(currentStone.reverseStone)) {
                workFlipPoints.push(workCell);
                workCell = workCell.move(direction);
            }

            // 対向先が自分の石であればflipPointsに通過した石を追加する
            if (this.getStone(workCell).equal(currentStone)) {

                flipPoints.push(...workFlipPoints);
            }
        })

        // 番兵分の番地をずらす
        return flipPoints;
    }

    count(target: Stone): number{
        return this.grid.flat().filter(stone => stone.equal(target)).length;
    }
}

export const initGrid: Stone[][] = [
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.white(), Stone.black(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.black(), Stone.white(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()],
    [Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none(), Stone.none()]
]