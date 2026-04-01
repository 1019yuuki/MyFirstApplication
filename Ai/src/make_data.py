import numpy as np
import torch
import os
import glob
import reversi_logic

def make_input_tensor(board, player):
    ch1 = (board == player).astype(np.float32)      # 自分の石
    ch2 = (board == -player).astype(np.float32)     # 相手の石
    ch3 = reversi_logic.get_legal_moves_mask(board, player)           # 合法手
    return np.stack([ch1, ch2, ch3])

# --- 全ファイルをまとめて出力するメインロジック ---
def export_npz(input_dir, output_path):
    """
    input_dir 内の全 .wtb ファイルを読み込み、1つの output_path (.npz) に保存
    """
    # 1. 出力先ディレクトリの作成（前回の不具合対策）
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    # 2. 指定フォルダ内の全 .wtb ファイルを取得
    wtb_files = glob.glob(os.path.join(input_dir, "*.wtb"))
    if not wtb_files:
        print(f"エラー: {input_dir} 内に .wtb ファイルが見つかりません。")
        return

    all_inputs = []
    all_targets = []

    print(f"合計 {len(wtb_files)} 個のファイルを処理します...")

    for wtb_path in wtb_files:
        print(f"処理中: {os.path.basename(wtb_path)}")
        
        with open(wtb_path, 'rb') as f:
            f.read(16) # ヘッダ飛ばし
            while True:
                data = f.read(68)
                if not data: break

                black_score = data[4]
                if black_score > 32:
                    winner = 1
                elif black_score < 32:
                    winner = -1
                else:
                    winner = 0 # 引き分け

                # 引き分けの場合は学習データから除外
                if winner == 0:
                    continue

                moves = data[8:]
                board = np.zeros((8, 8), dtype=np.int8)
                # 初期配置
                board[3,3], board[4,4] = -1, -1
                board[3,4], board[4,3] = 1, 1
                current_player = 1
                
                for i, (m) in enumerate(moves):
                    if m == 0: break
                    # 10の位 -1, 1の位 -1
                    col, row = (m // 10) - 1, (m % 10) - 1

                    if len(reversi_logic.get_flip_points(board, row, col, current_player)) == 0:
                        print(f"不整合のため対局を中断して次へ: {wtb_path}/{i}/row:{row}, col:{col}")
                        break 

                    # テンソル化してリストへ追加
                    if current_player == winner:
                        all_inputs.append(make_input_tensor(board, current_player))
                        all_targets.append(row * 8 + col)
                    
                    # 盤面更新
                    board = reversi_logic.update_board(board, current_player, row, col)
                    current_player = reversi_logic.get_next_player(board, current_player)

                    # どちらも打てなくなった場合、対局終了
                    if current_player == 0:
                        break


    # 3. まとめて圧縮保存
    print(f"全 {len(all_targets)} 局面を保存中... (時間がかかる場合があります)")
    np.savez_compressed(output_path, x=np.array(all_inputs), y=np.array(all_targets))
    print(f"完了: {output_path} に保存しました。")

# --- 実行 ---
# 入力元フォルダと、出力先のファイル名を指定してください
export_npz("./data/wtb/", "./data/npz/train_data.npz")
