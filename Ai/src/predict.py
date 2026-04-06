import torch
import numpy as np
import reversi_logic
from reversi_model import ReversiNet

def predict_one_move(model_path, board, player, turn_num):
    # 1. モデルの準備 (5ch対応)
    model = ReversiNet()
    model.load_state_dict(torch.load(model_path))
    model.eval()

    # 2. 5チャンネル入力データの作成
    ch1 = (board == player).astype(np.float32)      # 自分の石
    ch2 = (board == -player).astype(np.float32)     # 相手の石
    ch3 = reversi_logic.get_legal_moves_mask(board, player).astype(np.float32) # 合法手
    
    # ch4: 手番フラグ (黒番: 1.0, 白番: -1.0)
    turn_flag = 1.0 if player == 1 else -1.0
    ch4 = np.full((8, 8), turn_flag, dtype=np.float32)
    
    # ch5: 進行度 (0.0 ~ 1.0)
    progress = turn_num / 60.0
    ch5 = np.full((8, 8), progress, dtype=np.float32)

    # (5, 8, 8) にスタックしてバッチ次元を追加
    input_tensor = torch.from_numpy(np.stack([ch1, ch2, ch3, ch4, ch5])).float().unsqueeze(0)

    # 3. 推論 (Inference)
    with torch.no_grad():
        policy_out, value_out = model(input_tensor)
        
        # Policy: LogSoftmaxから確率に戻す
        probs = torch.exp(policy_out).cpu().numpy().reshape(8, 8)
        
        # Value: 石数差の期待値 (-1.0 ~ 1.0)
        value_score = value_out.item()

    # 4. 結果の解析
    best_move_idx = np.argmax(probs)
    row, col = best_move_idx // 8, best_move_idx % 8
    
    # 石数差に換算
    est_stones = value_score * 64
    
    print(f"\n--- AI Prediction Result (Turn: {turn_num}) ---")
    print(f"AIの推奨手: 行{row}, 列{col} (Index: {best_move_idx})")
    print(f"そのマスの確信度: {probs[row, col]*100:.2f}%")

    # 形勢判断の表示
    status = "優勢" if value_score > 0.05 else "劣勢" if value_score < -0.05 else "互角"
    print(f"AIの形勢判断 (Value): {value_score:.4f} (推定石数差: {est_stones:+.1f}石 / {status})")
    
    print("\n[AIの思考マップ（各マスの選択確率 %）]")
    print(np.array2string(probs * 100, precision=1, suppress_small=True))
    
    return row, col

# --- テスト実行 ---
# ほぼ真っ黒の盤面（終盤想定）
test_board = np.array([[-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, 1, -1, 0],
                        [-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1, -1, -1, -1]])
test_player = -1 # 黒
current_turn = 58 # ほぼ終盤

# 手数(turn_num)を渡して予測
predict_one_move("./models/reversi_model.pth", test_board, test_player, current_turn)
