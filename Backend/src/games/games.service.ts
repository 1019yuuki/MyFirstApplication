import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { version } from 'node:os';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GamesService {
    constructor(private prisma: PrismaService) { }

    async CreateGame(): Promise<Game> {
        const game = await this.prisma.game.create({
            data: {
                board: this.ConvertBoardToFlat(initBoard),
                nextStone: "BLACK"
            }
        });

        console.log(game.id);

        return { id: game.id, board: this.ConvertBoardFromFlat(game.board), nextStone: game.nextStone, version: game.version }
    }

    async UpdateGameById(id: string, x: number, y: number, stoneType: StoneType): Promise<Game> {
        // 盤面を取得する
        const game = await this.FindById(id);

        // 石を打つ
        const updated = await this.PutStone(x, y, game);

        // 更新したゲーム情報を返却する
        return updated;
    }

    async UpdateGameByCpu(id: string): Promise<Game> {
        // 盤面を取得する
        const game = await this.FindById(id);

        // 石が打てる箇所を取得する
        const putablePoints: Cell[] = [];

        game.board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (game.board[y][x] === "NONE" && this.GetFlipPoints(x, y, game.board, game.nextStone).length > 0) {
                    putablePoints.push({ x, y });
                }
            })
        })

        const tier1: Cell[] = [
            { x: 0, y: 0 }, { x: 0, y: 7 }, { x: 7, y: 0 }, { x: 7, y: 7 }
        ]

        const tier2: Cell[] = [
            { x: 2, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 5 },
            { x: 2, y: 7 }, { x: 5, y: 7 }, { x: 7, y: 2 }, { x: 7, y: 5 },
        ]

        const tier3: Cell[] = [
            { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 2, y: 5 }, { x: 5, y: 5 }
        ]

        const tier4: Cell[] = [
            { x: 0, y: 3 }, { x: 0, y: 4 },
            { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 },
            { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 6 },
            { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
            { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 },
            { x: 5, y: 1 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 6 },
            { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
            { x: 7, y: 3 }, { x: 7, y: 4 }
        ]

        // 石を打つ場所を決める
        const { x, y } = this.GetPutPoint(putablePoints, tier1, tier2, tier3, tier4);

        // 石を打つ
        const updated = await this.PutStone(x, y, game);



        // // 石を打つ番地をランダムで決定する
        // let putIndex = Math.floor(Math.random() * putablePoints.length);
        // if (putIndex === putablePoints.length) {
        //     putIndex = putablePoints.length - 1;
        // }

        // // 石を打つ
        // const updated = await this.PutStone(putablePoints[putIndex].x, putablePoints[putIndex].y, game);

        // 更新したゲーム情報を返却する
        return updated;
    }

    private GetPutPoint(putablePoints: Cell[], ...args: Cell[][]): Cell {

        let putPoint: Cell | null = null;

        args.forEach((tier) => {
            const union = [...putablePoints.filter((item) => tier.some((item2) => item.x === item2.x && item.y === item2.y))]

            if (putPoint !== null) {
                return;
            }

            if (union.length > 0) {
                let putIndex = Math.floor(Math.random() * union.length);
                if (putIndex === union.length) {
                    putIndex = union.length - 1;
                }
                putPoint = { x: union[putIndex].x, y: union[putIndex].y };
                console.log(args.indexOf(tier));
            }

        })
        

        if (putPoint === null) {
            let putIndex = Math.floor(Math.random() * putablePoints.length);
            if (putIndex === putablePoints.length) {
                putIndex = putablePoints.length - 1;
            }
            putPoint = { x: putablePoints[putIndex].x, y: putablePoints[putIndex].y };
            console.log(args.length);
        }

        return putPoint;
    }

    private async FindById(id: string): Promise<Game> {
        const game = await this.prisma.game.findUnique({
            where: {
                id
            }
        })

        if (!game) {
            throw new NotFoundException();
        }

        return { board: this.ConvertBoardFromFlat(game.board), nextStone: game.nextStone, id: game.id, version: game.version }
    }

    private async PutStone(x: number, y: number, currentGame: Game): Promise<Game> {
        // 石が打てるか確認する
        const flipPoints = this.GetFlipPoints(x, y, currentGame.board, currentGame.nextStone);

        if (flipPoints.length === 0) {
            throw new BadRequestException();
        }

        // 石を打つ
        currentGame.board[y][x] = currentGame.nextStone;

        //　石をひっくり返す
        flipPoints.forEach((flipPoint) => {
            currentGame.board[flipPoint.y][flipPoint.x] = currentGame.nextStone;
        })

        // 次のターンの石を判定する
        let nextStone: StoneType = "NONE";

        if (this.CanPutStone(currentGame.board, this.GetReverseStone(currentGame.nextStone))) {
            nextStone = this.GetReverseStone(currentGame.nextStone);
        }
        else if (this.CanPutStone(currentGame.board, currentGame.nextStone)) {
            nextStone = currentGame.nextStone;
        }

        // ゲームを更新する
        const updatedGame = await this.prisma.game.update({
            where: {
                id: currentGame.id,
                version: currentGame.version
            },
            data: {
                board: this.ConvertBoardToFlat(currentGame.board),
                nextStone,
                version: currentGame.version + 1
            }
        });

        // 更新したゲーム情報を返却する
        return { board: this.ConvertBoardFromFlat(updatedGame.board), nextStone: updatedGame.nextStone, id: updatedGame.id, version: updatedGame.version }
    }

    private CanPutStone(board: StoneType[][], targetStone: StoneType): boolean {
        return board.some((row, y) => {
            return row.some((_, x) => {
                if (board[y][x] !== "NONE") {
                    return false;
                }
                return this.GetFlipPoints(x, y, board, targetStone).length > 0;
            })
        });
    }

    private GetFlipPoints(x: number, y: number, board: StoneType[][], currentStone: StoneType): Cell[] {
        const directions: Cell[] = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: 0 }
        ]

        // boardに番兵を追加する
        const sentinelBoard = this.AddBoardSentinel(board);

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
            if (sentinelBoard[workY][workX] !== this.GetReverseStone(currentStone)) {
                return;
            }

            // 相手の石以外が出るまで各方向へ処理を進める
            while (sentinelBoard[workY][workX] === this.GetReverseStone(currentStone)) {
                workFlipPoints.push({ x: workX, y: workY });
                workX = workX + direction.x;
                workY = workY + direction.y;
            }

            // 対向先が自分の石であればflipPointsに通過した石を追加する
            if (sentinelBoard[workY][workX] === currentStone) {
                workFlipPoints.forEach((flipPoint) => { flipPoints.push(flipPoint); })
            }
        })

        // 番兵分の番地をずらす
        return flipPoints.map((flipPoint) => ({ x: flipPoint.x - 1, y: flipPoint.y - 1 }));
    }

    private GetReverseStone(currentStone: StoneType | SentinelStoneType): StoneType {
        return currentStone === "BLACK" ? "WHITE" : "BLACK";
    }

    private AddBoardSentinel(board: StoneType[][]): SentinelStoneType[][] {
        const sentinelBoard: SentinelStoneType[][] = [];
        const sentinelRow: SentinelStoneType[] = ["WALL", "WALL", "WALL", "WALL", "WALL", "WALL", "WALL", "WALL", "WALL", "WALL"]

        sentinelBoard.push(sentinelRow);

        board.forEach((row) => {
            sentinelBoard.push(["WALL", ...row, "WALL"]);
        })

        sentinelBoard.push(sentinelRow);

        return sentinelBoard;
    }

    private ConvertBoardToFlat(board: StoneType[][]): StoneType[] {
        return board.flat();
    }

    private ConvertBoardFromFlat(flatBoard: StoneType[]): StoneType[][] {

        let index: number = 0;
        let row: StoneType[] = [];
        const result: StoneType[][] = [];
        flatBoard.forEach((cell) => {
            row.push(cell);

            if (index === 7) {
                result.push(row);
                index = 0;
                row = [];
            }
            else {
                index++;
            }
        });

        return result;
    }
}

export interface Game {
    id: string,
    board: StoneType[][],
    nextStone: StoneType,
    version: number
}

interface Cell {
    x: number,
    y: number
}

const initBoard: StoneType[][] = [
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "WHITE", "BLACK", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "BLACK", "WHITE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
]

type StoneType = "BLACK" | "WHITE" | "NONE"
type SentinelStoneType = StoneType | "WALL"