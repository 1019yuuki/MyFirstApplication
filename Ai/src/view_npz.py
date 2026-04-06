import numpy as np

def load_data(path):
    # mmap_mode='r' を使うと巨大なファイルもメモリを節約して読み込めます
    return np.load(path, mmap_mode='r')

def view_structure(data):
    print("="*40)
    print("  DATA STRUCTURE CHECK")
    print("="*40)
    print("Keys:", data.files) 
    print("X shape (Inputs):", data['x'].shape) # (局面数, 5, 8, 8) になっているはず
    print("Y shape (Policy):", data['y'].shape) # (局面数,)
    print("Z shape (Value) :", data['z'].shape) # (局面数,)

def view_data(data, sample_size=5):
    X = data['x']
    Y = data['y']
    Z = data['z']

    for idx in range(sample_size):
        sample_board = X[idx]      # (5, 8, 8)
        sample_move = Y[idx]       # 0-63
        sample_value = Z[idx]      # -1.0 ~ 1.0 (石数比率)

        # Valueの解釈（石数差に換算）
        score_diff = sample_value * 64
        result_text = f"Value: {sample_value:.3f} (Est. {score_diff:+.1f} stones)"
        
        print(f"\n" + "="*50)
        print(f"  SAMPLE INDEX: {idx}")
        print(f"  {result_text}")
        print(f"  Target Move: {sample_move}")
        print("="*50)

        # 5チャンネル全ての表示
        channel_names = [
            'Ch1: My Stones', 
            'Ch2: Opponent Stones', 
            'Ch3: Legal Moves',
            'Ch4: Turn Flag (1.0=Black, -1.0=White)',
            'Ch5: Progress (Turn/60)'
        ]
        
        for i in range(5):
            print(f"\n[{channel_names[i]}]")
            # Ch4とCh5は全マス同じ値なので、代表して左上の値だけ表示して省略も可能ですが、
            # 確認のため最初は全表示します
            print(np.array2string(sample_board[i], precision=2, suppress_small=True))

        # 正解手(Policy)の盤面表示
        print(f"\n[Teacher Signal (Policy)]")
        teacher_view = np.zeros(64, dtype=np.int8)
        if 0 <= sample_move < 64:
            teacher_view[sample_move] = 1
            print(np.array2string(teacher_view.reshape(8, 8), precision=0, suppress_small=True))
        else:
            print(f"  Invalid or special move index: {sample_move}")

# --- 実行 ---
# ファイル名は5ch版の新しいものを指定してください
data = load_data("./data/npz/train_data.npz")
view_structure(data)
view_data(data, 10) # まずは3件ほど詳細に確認
