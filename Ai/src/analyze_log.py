import pandas as pd
import matplotlib.pyplot as plt

def analyze_training_log(log_path):
    # 1. CSVの読み込み
    df = pd.read_csv(log_path)
    
    # 2. 統計量の算出
    print(f"--- 学習ログ統計 ---")
    print(f"総ステップ数: {len(df) * 10}") # 10ステップ毎保存の場合
    print(f"最終Loss: {df['loss'].iloc[-1]:.4f}")
    print(f"最小Loss: {df['loss'].min():.4f}")
    
    # 3. 移動平均（Smoothing）の計算
    # 生データだと振動が激しいので、50件（500ステップ分）の平均をとる
    df['loss_smooth'] = df['loss'].rolling(window=50).mean()

    # 4. グラフ描画
    plt.figure(figsize=(10, 6))
    
    # 薄く生データをプロット
    plt.plot(df['loss'], alpha=0.3, color='dodgerblue', label='Raw Loss')
    # 濃く移動平均をプロット
    plt.plot(df['loss_smooth'], color='blue', linewidth=2, label='Smoothed Loss (Window=50)')
    
    # 補助線：初期値（4.15）
    plt.axhline(y=4.15, color='gray', linestyle='--', label='Initial Guess')
    # 補助線：目標値（1.0）
    plt.axhline(y=1.0, color='red', linestyle=':', label='Target (Intermediate)')

    plt.title("Reversi AI Training Progress", fontsize=14)
    plt.xlabel("Log Steps (Every 10 batches)", fontsize=12)
    plt.ylabel("Loss (Negative Log Likelihood)", fontsize=12)
    plt.grid(True, which='both', linestyle='--', alpha=0.5)
    plt.legend()
    
    # 5. 画像として保存
    plt.savefig("./logs/loss_curve.png")
    print("\nグラフを ./logs/loss_curve.png に保存しました。")
    plt.show()

# 実行
if __name__ == "__main__":
    analyze_training_log("./logs/training_log.csv")
