import { Inject, Injectable } from "@nestjs/common";
import { type IAiEngine } from "../interfaces/ai-engine.interface";
import { Game } from "../entities/game.entity";
import { Cell } from "../value-objects/cell.vo";
import { Board } from "../value-objects/board.vo";
import { Stone } from "../value-objects/stone.vo";

@Injectable()
export class CpuStrategyService {
    constructor(@Inject('IAiService') private ai: IAiEngine) { }

    async predict(game: Game, depth: number = 5, threshold: number = 0.01, searchRange: number = 3): Promise<Cell> {
        
        const aiStone = game.nextStone;
        const currentTurn = game.turn;

        // 1手目の候補を取得（Policy上位で絞り込み）
        const puttable = game.board.getputablePoints(aiStone);
        const { policies } = await this.ai.predict(game.board, aiStone, currentTurn, puttable);

        // 上位3手を再帰的に探索する
        const firstMoves = policies.filter(policy => {
            return puttable.some(p => p.x === policy.x && p.y === policy.y);
        }).sort((a, b) => b.policy - a.policy).slice(0, searchRange);

        const moveEvaluations: { x: number, y: number, score: number, policy: number }[] = [];

        for (const { x, y, policy } of firstMoves) {

            const nextBoard = game.board.placeStone(aiStone, Cell.create({ x, y }));

            // 2手目以降を再帰的に探索（自分は打ったので、次は相手の番から開始）
            const score = await this.minimax(nextBoard, aiStone.reverseStone, aiStone, currentTurn + 1, depth - 1, threshold, searchRange);

            moveEvaluations.push({ x, y, score, policy });
        }

        // scoreとpolicyをもとに、打つ場所を決定する
        const { x, y, policy, score } = this.decideMoveEvaluation(moveEvaluations, aiStone, aiStone, threshold);

        // DEBUG:**************************************************************************
        moveEvaluations.forEach((evaluation, index) => {
            console.log(`Evaluations[${index}] : (${evaluation.x}, ${evaluation.y}) Score : ${evaluation.score.toFixed(4)} Policy : ${evaluation.policy.toFixed(4)}`);
        })
        console.log(`Sampling selected : (${x}, ${y}) Score : ${score.toFixed(4)} Policy : ${policy.toFixed(4)}`);
        // DEBUG_END:***********************************************************************

        return Cell.create({ x, y });
    }

    private async minimax(board: Board, currentStone: Stone, aiStone: Stone, currentTurn: number, depth: number, threshold: number, searchRange: number): Promise<number> {
        const puttable = board.getputablePoints(currentStone);

        // 終局判定（どちらも打てない）: 確定スコアを返す
        if (puttable.length === 0 && board.getputablePoints(currentStone.reverseStone).length === 0) {
            const aiCount = board.count(aiStone);
            const oppCount = board.count(aiStone.reverseStone);

            if (aiCount > oppCount) return aiCount / (aiCount + oppCount);  // AIの勝ち
            if (aiCount < oppCount) return -aiCount / (aiCount + oppCount); // AIの負け
            return 0.0;                          // 引き分け
        }

        // 葉ノード（探索の限界）: モデルの予測値を返す
        if (depth === 0) {
            const { score } = await this.ai.predict(board, currentStone, currentTurn, puttable);
            return currentStone.equal(aiStone) ? score : -score;
        }

        // パス処理
        if (puttable.length === 0) {
            return await this.minimax(board, currentStone.reverseStone, aiStone, currentTurn, depth, threshold, searchRange);
        }

        // 候補手の展開（上位3手）
        const { policies } = await this.ai.predict(board, currentStone, currentTurn, puttable);
        const topMoves = policies
            .filter(p => puttable.some(pt => pt.x === p.x && pt.y === p.y))
            .sort((a, b) => b.policy - a.policy)
            .slice(0, 3);

        // 子ノードの評価値を再帰的に取得
        const childEvaluations = await Promise.all(topMoves.map(async ({ x, y, policy }) => {
            const nextBoard = board.placeStone(currentStone, Cell.create({ x, y }));
            const score = await this.minimax(nextBoard, currentStone.reverseStone, aiStone, currentTurn + 1, depth - 1, threshold, searchRange);
            return { x, y, score, policy };
        }));

        // 子ノードから、最適なスコアを取得する
        const { score } = this.decideMoveEvaluation(childEvaluations, currentStone, aiStone, threshold);

        return score;
    }

    private decideMoveEvaluation(moveEvaluations: { x: number, y: number, score: number, policy: number }[], currentStone: Stone, aiStone: Stone, threshold: number): { x: number, y: number, score: number, policy: number } {

        // 基準となるスコアを決定（自分ならMax、相手ならMin）
        const baseScore = currentStone.equal(aiStone)
            ? Math.max(...moveEvaluations.map(e => e.score))
            : Math.min(...moveEvaluations.map(e => e.score));

        // 誤差(threshold)以内の候補を抽出
        const candidates = moveEvaluations.filter(e => Math.abs(baseScore - e.score) <= threshold);

        if (candidates.length > 1) {
            // 2. 合計Policyを計算
            const totalPolicy = candidates.reduce((sum, e) => sum + e.policy, 0);

            // 3. 乱数（0〜totalPolicyの間）を生成
            let random = Math.random() * totalPolicy;

            // 4. 累積和で当選した手を探す
            for (const cand of candidates) {
                random -= cand.policy;
                if (random <= 0) {
                    return cand;
                }
            }
        }
        return candidates[0];
    }
}