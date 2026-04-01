# import reversi_logic
# import numpy as np

# board = np.array([[0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, -1, 1, 0, 0, 0],
#         [0, 0, 0, 1, -1, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0]])

# player = 1
# row = 5
# col = 4



# updated_board = reversi_logic.update_board(board, player, row, col)

# print(updated_board)

import numpy as np

# データのロード
data = np.load("./data/npz/train_data.npz")
X = data['x']  # (N, 3, 8, 8)
Y = data['y']  # (N,)

total_samples = len(Y)
error_count = 0

print(f"全 {total_samples} 局面をチェック中...")

for i in range(total_samples):
    # 1. 正解のインデックス (0-63) を座標 (row, col) に戻す
    target_move = Y[i]
    row = target_move // 8
    col = target_move % 8
    
    # 2. 入力データの第3チャンネル（合法手マップ）のその座標を確認
    legal_value = X[i, 2, row, col]
    
    # 3. もし合法手マップが 0 なのに、そこが正解(Y)ならエラー
    if legal_value == 0:
        error_count += 1
        if error_count <= 5: # 最初の5件だけ詳細を表示
            print(f"❌ 不整合発見！ Index: {i}, 正解座標: ({row}, {col}), LegalMapの値: {legal_value}")

if error_count == 0:
    print("✅ 完璧です！すべての正解の手が、合法手マップ(Ch3)で 1.0 になっています。")
else:
    print(f"⚠️ 不整合が {error_count} 件見つかりました。")
    print(f"不備率: {error_count / total_samples * 100:.2f}%")

