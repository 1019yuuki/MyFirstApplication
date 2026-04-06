import numpy as np
import torch
import os
import glob
import reversi_logic

def make_input_tensor(board, player, turn_num):
    """
    5チャンネル入力テンソルを作成する
    ch1: 自分の石 (1.0)
    ch2: 相手の石 (1.0)
    ch3: 合法手マスク (1.0)
    ch4: 手番フラグ (黒番: 1.0, 白番: -1.0)
    ch5: 進行度 (turn_num / 60.0)
    """
    ch1 = (board == player).astype(np.float32)
    ch2 = (board == -player).astype(np.float32)
    ch3 = reversi_logic.get_legal_moves_mask(board, player).astype(np.float32)
    
    # レイヤ4: 手番フラグ (1=黒, -1=白)
    turn_flag = 1.0 if player == 1 else -1.0
    ch4 = np.full((8, 8), turn_flag, dtype=np.float32)
    
    # レイヤ5: 進行度 (0.0 ~ 1.0)
    progress = turn_num / 60.0
    ch5 = np.full((8, 8), progress, dtype=np.float32)
    
    return np.stack([ch1, ch2, ch3, ch4, ch5])

def calculate_final_value(black_score):
    """
    黒の石数から、最終的な石数比率によるValue(-1.0 ~ 1.0)を算出する。
    リバーシ標準ルール（空きマスは勝者のもの）を適用。
    """
    white_score = 64 - black_score

    # 空きマスを含めた最終処理
    if black_score > white_score:
        final_black = black_score + (64 - (black_score + white_score)) # 事実上 black_score は不変だが定義通り
        final_white = white_score
    elif white_score > black_score:
        final_black = black_score
        final_white = white_score + (64 - (black_score + white_score))
    else:
        final_black, final_white = 32, 32

    # 石数差を -1.0 ~ 1.0 に正規化
    # 自分が黒なら (B-W)/64, 白なら (W-B)/64
    diff = final_black - final_white

    return diff / 64.0

# --- 全ファイルをまとめて出力するメインロジック ---
def export_npz(input_dir, output_path, start_turn = 1):
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
    all_targets_y = []
    all_targets_z = []

    print(f"合計 {len(wtb_files)} 個のファイルを処理します...")

    for wtb_path in wtb_files:
        print(f"処理中: {os.path.basename(wtb_path)}")
        
        with open(wtb_path, 'rb') as f:
            f.read(16) # ヘッダ飛ばし
            while True:
                data = f.read(68)
                if not data: break

                moves = data[8:]



                # --- 追加：まず最後までシミュレーションして正しい石数を出す ---
                temp_board = np.zeros((8, 8), dtype=np.int8)
                temp_board[3,3], temp_board[4,4] = -1, -1
                temp_board[3,4], temp_board[4,3] = 1, 1
                temp_player = 1
                is_end = True
                
                for m in moves:
                    if m == 0: break
                    c, r = (m // 10) - 1, (m % 10) - 1

                    # 打てる場合のみ更新（壊れた棋譜対策）
                    if len(reversi_logic.get_flip_points(temp_board, r, c, temp_player)) > 0:
                        temp_board = reversi_logic.update_board(temp_board, temp_player, r, c)
                        temp_player = reversi_logic.get_next_player(temp_board, temp_player)
                    else:
                        if temp_player != 0:
                            is_end = False
                        break

                if is_end == False:
                    print(f"不整合のため対局を中断して次へ：{wtb_path}")
                    continue

                # 盤面から直接黒の石数をカウント
                black_score = int(np.sum(temp_board == 1))
                white_score = int(np.sum(temp_board == -1))
                
                # 最終Value（黒視点）を計算（これで0.xxになる）
                final_value_black = calculate_final_value(black_score)

                # 勝敗判定も盤面から行う
                if black_score > white_score:
                    winner = 1
                elif black_score < white_score:
                    winner = -1
                else:
                    winner = 0 # 引き分け除外
                
                if winner == 0: continue
                # --- シミュレーション終了 ---

                print(f"Winner：{winner}, socre：{final_value_black}")

                board = np.zeros((8, 8), dtype=np.int8)

                # 初期配置
                board[3,3], board[4,4] = -1, -1
                board[3,4], board[4,3] = 1, 1
                current_player = 1
                
                for i, (m) in enumerate(moves):
                    if m == 0: break

                    turn_num = i + 1 # 現在の手数

                    # 10の位 -1, 1の位 -1
                    col, row = (m // 10) - 1, (m % 10) - 1

                    # --- 修正ポイント：指定手数以降のみリストに追加 ---
                    if turn_num >= start_turn:
                        all_inputs.append(make_input_tensor(board, current_player, turn_num))
                        if current_player == winner:
                            all_targets_y.append(row * 8 + col)
                            # all_targets_z.append(1.0)
                        else:
                            all_targets_y.append(-100) 
                            # all_targets_z.append(-1.0)

                        # Value: 現在のプレイヤーから見た最終損益
                        # 黒番ならそのまま、白番なら符号を反転
                        v = final_value_black if current_player == 1 else -final_value_black
                        all_targets_z.append(v)
                    
                    # 盤面更新
                    board = reversi_logic.update_board(board, current_player, row, col)
                    current_player = reversi_logic.get_next_player(board, current_player)

                    # どちらも打てなくなった場合、対局終了
                    if current_player == 0:
                        break


    # まとめて圧縮保存
    print(f"全 {len(all_targets_z)} 局面を保存中...")
    np.savez_compressed(
        output_path, 
        x=np.array(all_inputs, dtype=np.float32), 
        y=np.array(all_targets_y, dtype=np.int64), 
        z=np.array(all_targets_z, dtype=np.float32)
    )
    print(f"完了: {output_path}")

# --- 実行 ---
# 入力元フォルダと、出力先のファイル名を指定してください
export_npz("./data/wtb/", "./data/npz/train_data.npz", start_turn=35)
