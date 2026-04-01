import numpy as np

def load_data(path):
    return np.load(path)

def view_structure(data):
    # 2. 格納されている変数名を確認（通常は 'x' と 'y'）
    print("Keys:", data.files) 

    # 3. 各行列の形状（Shape）を確認
    # x: (局面数, 3, 8, 8), y: (局面数,)
    print("X shape (Inputs):", data['x'].shape)
    print("Y shape (Targets):", data['y'].shape)

def view_data(data, sample_size = 5):
    X = data['x']
    Y = data['y']

    for idx in range(sample_size):
        sample_board = X[idx]      # (3, 8, 8)
        sample_move = Y[idx]       # スカラー (0-63)

        print(f"\n" + "="*40)
        print(f"  SAMPLE INDEX: {idx}  (Target Move: {sample_move})")
        print("="*40)

        # 1. 入力チャンネル (3枚) の表示
        channel_names = ['Ch1: My Stones', 'Ch2: Opponent Stones', 'Ch3: Legal Moves']
        for i in range(3):
            print(f"\n[{channel_names[i]}]")
            print(np.array2string(sample_board[i], precision=0, suppress_small=True))

        # 2. 正解手 (Y) を 8x8 形式に復元して表示
        print(f"\n[Teacher Signal (Correct Move Index: {sample_move})]")
        teacher_view = np.zeros(64, dtype=np.int8)
        teacher_view[sample_move] = 1
        print(np.array2string(teacher_view.reshape(8, 8), precision=0, suppress_small=True))



data = load_data("./data/npz/train_data.npz")
view_structure(data)
view_data(data, 5)