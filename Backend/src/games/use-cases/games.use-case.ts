import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IGamesRepository } from '../domain/repositories/games.repository.interface';
import { Game } from '../domain/entities/game.model';
import { Cell } from '../domain/entities/board.model';

@Injectable()
export class GamesUseCase {
    constructor(@Inject('IGamesRepository') private repository: IGamesRepository) { }

    async createGame(): Promise<Game> {

        // ゲームの新規作成
        const game = await this.repository.create()

        return game
    }

    async updateGameById(id: string, x: number, y: number): Promise<Game> {

        // 盤面を取得する
        const game = await this.repository.findById(id);

        // 石を打つ
        const updated = await this.PutStone(x, y, game);

        // 更新したゲーム情報を返却する
        return updated;
    }

    async updateGameByCpu(id: string): Promise<Game> {
        // 盤面を取得する
        const game = await this.repository.findById(id);

        // 石が打てる箇所を取得する
        const putablePoints: Cell[] = [];

        game.board.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (game.board.getStone(x, y).stoneType === "NONE" && game.board.getFlipPoints(x, y, game.nextStone).length > 0) {
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

    private async PutStone(x: number, y: number, currentGame: Game): Promise<Game> {
        
        // 石が打てるか確認する
        const flipPoints = currentGame.board.getFlipPoints(x, y, currentGame.nextStone);

        if (flipPoints.length === 0) {
            throw new BadRequestException("No Stone can reverce.");
        }

        // 石を打つ
        currentGame.putStone(x, y);

        //　石をひっくり返す
        flipPoints.forEach((flipPoint) => {
            currentGame.putStone(flipPoint.x, flipPoint.y);
        })

        // 次のターンの石を判定する
        currentGame.updateNextStone();

        // ゲームを更新する
        const updated = await this.repository.update(currentGame);

        // 更新したゲーム情報を返却する
        return updated
    }
}