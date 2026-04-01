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

  async predict(board: number[][], player: number, puttablePoint: { x: number, y: number }[]): Promise<{ x: number, y: number }> {
    const myBoard = board.map(row => row.map(cell => cell === player ? 1 : 0));
    const opponentBoard = board.map(row => row.map(cell => cell === -player ? 1 : 0));
    const puttableBoard = board.map((row, y) => row.map((cell, x) => puttablePoint.some(p => p.x === x && p.y === y) ? 1 : 0));

    const boardTensor = [myBoard, opponentBoard, puttableBoard];

    // 2. 数理的なフラット化 (3x8x8 = 192要素の 1次元ベクトルへ)
    // [ [ [row0], [row1]... ], [channel1]... ] を平坦な Float32Array に変換
    const flatData = new Float32Array(3 * 8 * 8);
    let offset = 0;
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 8; r++) {
        for (let l = 0; l < 8; l++) {
          flatData[offset++] = boardTensor[c][r][l];
        }
      }
    }

    // 3. 4次元テンソルとしての定義 [BatchSize, Channels, Height, Width]
    const tensor = new ort.Tensor('float32', flatData, [1, 3, 8, 8]);

    // 4. 推論実行 (Pythonの model(input) と同じ)
    // 'input' と 'output' は python の torch.onnx.export で指定した名前に合わせる
    const feeds = { input: tensor };
    const results = await this.session.run(feeds);
    const output = results.output.data as Float32Array; // 64次元の LogSoftmax ベクトル

    // 5. アルグマックス (argmax): 最も確率（スコア）が高いインデックスを特定
    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < output.length; i++) {
      if (output[i] > maxVal) {
        maxVal = output[i];
        maxIdx = i;
      }
    }

    return { x: maxIdx % 8, y: Math.floor(maxIdx / 8) };
  }
}
