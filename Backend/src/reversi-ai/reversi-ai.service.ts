import { Injectable, OnModuleInit } from '@nestjs/common';
import * as ort from 'onnxruntime-web';

@Injectable()
export class ReversiAiService implements OnModuleInit {
  private session: ort.InferenceSession;

  async onModuleInit() {
    // 1. 学習して ONNX 出力したファイルをロード
    this.session = await ort.InferenceSession.create('./models/reversi_model.onnx', {
      executionProviders: ['wasm']
    });
  }

  async predict(board: number[][], player: number, turn: number, puttablePoint: { x: number, y: number }[]): Promise<{ policies: { x: number, y: number, policy: number }[], score: number }> {
    const myBoard: number[][] = board.map(row => row.map(cell => cell === player ? 1 : 0));
    const opponentBoard: number[][] = board.map(row => row.map(cell => cell === -player ? 1 : 0));
    const puttableBoard: number[][] = board.map((row, y) => row.map((cell, x) => puttablePoint.some(p => p.x === x && p.y === y) ? 1 : 0));
    const playerBoard: number[][] = Array.from({ length: 8 }, () => Array(8).fill(player));
    const turnBoard: number[][] = Array.from({ length: 8 }, () => Array(8).fill(turn / 60));
    const boardTensor = [myBoard, opponentBoard, puttableBoard, playerBoard, turnBoard];

    // 2. 数理的なフラット化 (3x8x8 = 192要素の 1次元ベクトルへ)
    // [ [ [row0], [row1]... ], [channel1]... ] を平坦な Float32Array に変換
    const flatData = new Float32Array(5 * 8 * 8);
    let offset = 0;
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 8; r++) {
        for (let l = 0; l < 8; l++) {
          flatData[offset++] = boardTensor[c][r][l];
        }
      }
    }

    // 3. 4次元テンソルとしての定義 [BatchSize, Channels, Height, Width]
    const tensor = new ort.Tensor('float32', flatData, [1, 5, 8, 8]);

    // 4. 推論実行 (Pythonの model(input) と同じ)
    // 'input' と 'output' は python の torch.onnx.export で指定した名前に合わせる
    const feeds = { input: tensor };
    const results = await this.session.run(feeds);

    const policies = results["output"].data as Float32Array;
    const value = results["tanh"].data as Float32Array;
    const returnPolicies = Array.from(policies).map((policy, index) => ({ x: index % 8, y: Math.floor(index / 8), policy: Math.exp(policy) }));
    const [returnValue] = Array.from(value);

    return { policies: returnPolicies, score: returnValue };
  }
}
