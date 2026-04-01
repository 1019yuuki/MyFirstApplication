import torch
import numpy as np
import reversi_logic
from reversi_model import ReversiNet

def predict_one_move(model_path, board, player):
    # 1. モデルの準備
    model = ReversiNet()
    model.load_state_dict(torch.load(model_path))
    model.eval()

    # 2. 入力データの作成 (3, 8, 8)
    # make_input_tensorと同じロジック
    ch1 = (board == player).astype(np.float32)
    ch2 = (board == -player).astype(np.float32)
    ch3 = reversi_logic.get_legal_moves_mask(board, player)
    input_tensor = torch.from_numpy(np.stack([ch1, ch2, ch3])).float().unsqueeze(0)

    # 3. 推論 (Inference)
    with torch.no_grad():
        log_probs = model(input_tensor)
        probs = torch.exp(log_probs).cpu().numpy().reshape(8, 8)

    # 4. 結果の解析
    best_move_idx = np.argmax(probs)
    row, col = best_move_idx // 8, best_move_idx % 8
    
    print(f"\n--- AI Prediction Result ---")
    print(f"AIの推奨手: 行{row}, 列{col} (Index: {best_move_idx})")
    print(f"そのマスの確信度: {probs[row, col]*100:.2f}%")
    
    print("\n[AIの思考マップ（各マスの選択確率 %）]")
    # 確率をパーセント表示で見やすく整形
    print(np.array2string(probs * 100, precision=1, suppress_small=True))
    
    return row, col

# --- テスト用の盤面 (初期配置) ---
# test_board = np.zeros((8, 8), dtype=np.int8)
# test_board[3, 3], test_board[4, 4] = -1, -1
# test_board[3, 4], test_board[4, 3] = 1, 1


test_board = np.array([[0, 0, 0, 0, 0, 0, 0, 0],
                       [0, 0, 0, 0, 0, 0, 0, 0],
                       [0, 0, 1, 1, 1, -1, 0, 0],
                       [0, 0, -1, 1, -1, -1, 0, 0],
                       [0, 0, 0, -1, 1, 0, 0, 0],
                       [0, 0, -1, -1, -1, -1, 0, 0],
                       [0, 0, 0, 0, 0, 0, 0, 0],
                       [0, 0, 0, 0, 0, 0, 0, 0],])
test_player = 1

# 黒番(1)で予測させてみる
predict_one_move("./models/reversi_model.pth", test_board, test_player)
