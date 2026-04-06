import pandas as pd
import matplotlib.pyplot as plt

def analyze_training_log(log_path):
    # 1. CSVの読み込み（列名を loss_p, loss_v で統一）
    try:
        df = pd.read_csv(log_path, names=['epoch', 'step', 'loss_p', 'loss_v'], header=None)
    except Exception as e:
        print(f"読み込み失敗: {e}")
        return

    # 数値型に変換
    df['loss_p'] = pd.to_numeric(df['loss_p'], errors='coerce')
    df['loss_v'] = pd.to_numeric(df['loss_v'], errors='coerce')
    
    # 2. 統計量の算出
    print(f"--- 学習ログ統計 ---")
    print(f"最終 Policy Loss: {df['loss_p'].iloc[-1]:.4f}")
    print(f"最終 Value  Loss: {df['loss_v'].iloc[-1]:.4f}")
    print(f"最小 Policy Loss: {df['loss_p'].min():.4f}")
    print(f"最小 Value  Loss: {df['loss_v'].min():.4f}")
    
    # 3. 移動平均（Smoothing）の計算
    window_size = 50
    df['p_smooth'] = df['loss_p'].rolling(window=window_size).mean()
    df['v_smooth'] = df['loss_v'].rolling(window=window_size).mean()
    df = df.dropna(subset=['loss_p', 'loss_v']) # エラー行を捨てる

    # 4. グラフ描画 (上下2段構成)
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10), sharex=True)
    
    # --- 上段: Policy Loss (指し手の精度) ---
    ax1.plot(df['loss_p'], alpha=0.6, color='skyblue', label='Raw Policy Loss')
    ax1.plot(df['p_smooth'], color='dodgerblue', linewidth=4, label='Smoothed')
    ax1.set_ylabel("Policy Loss (NLL)", fontsize=12)
    ax1.set_title("Policy Head Training Progress (Expert Mimicry)", fontsize=14)
    ax1.grid(True, alpha=0.3)
    ax1.legend()

    # --- 下段: Value Loss (勝敗予測の精度) ---
    ax2.plot(df['loss_v'], alpha=0.6, color='salmon', label='Raw Value Loss')
    ax2.plot(df['v_smooth'], color='red', linewidth=4, label='Smoothed')
    ax2.set_ylabel("Value Loss (MSE)", fontsize=12)
    ax2.set_xlabel("Log Steps", fontsize=12)
    ax2.set_title("Value Head Training Progress (Win/Loss Prediction)", fontsize=14)
    ax2.grid(True, alpha=0.3)
    ax2.legend()

    plt.tight_layout()
    
    # 5. 画像として保存
    plt.savefig("./logs/dual_loss_curve.png")
    print(f"\nグラフを ./logs/dual_loss_curve.png に保存しました。")
    plt.show()

# 実行
if __name__ == "__main__":
    analyze_training_log("./logs/training_log.csv")
