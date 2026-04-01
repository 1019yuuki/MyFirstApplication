import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from reversi_model import ReversiNet
from torch.utils.data import TensorDataset, DataLoader
import os
import csv



# 学習ループのシミュレーション
def train_step(boards, teacher_moves, b_size = 128, n_epoch = 1, lerning_rate = 0.001, model_out_path="./models/reversi_model.pth", log_out_path="./logs/training_log.csv"):

    # 学習のセットアップ
    model = ReversiNet()

    if os.path.exists(model_out_path):
        print(f"既存のモデル {model_out_path} を読み込んで学習を再開します...")
        model.load_state_dict(torch.load(model_out_path))
    else:
        print("新規モデルで学習を開始します。")

    # 損失関数：Cross Entropy（予測分布と正解分布の距離を測定）
    criterion = nn.NLLLoss() 

    # 最適化手法：Adam（各wの学習率を動的に調整する高度な勾配降下法）
    optimizer = optim.Adam(model.parameters(), lr=lerning_rate)


    # 1. 保存先ディレクトリを自動作成
    os.makedirs(os.path.dirname(model_out_path), exist_ok=True)
    os.makedirs(os.path.dirname(log_out_path), exist_ok=True)

        # 2. ログファイルのヘッダー準備
    with open(log_out_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['epoch', 'step', 'loss'])

    model.train() # 学習モードへ

    dataset = TensorDataset(boards, teacher_moves)

    train_loader = DataLoader(dataset, b_size, shuffle=True)


    for epoch in range(n_epoch):

        for i, (inputs, labels) in enumerate(train_loader):
        
            # --- 順伝播 (Forward) ---
            log_probs = model(inputs)
            
            # --- 誤差計算 (Loss) ---
            # 正解の場所のlog_probを最大化（Lossを最小化）する
            loss = criterion(log_probs, labels)
            
            # --- 逆伝播 (Backward) ---
            optimizer.zero_grad() # 前の勾配をリセット
            loss.backward()       # 各重みwでの偏微分を実行
            optimizer.step()      # 勾配の反対方向にwを更新

            # 5. 指定されたパスへログを追記
            if i % 50 == 0:
                print(f"Epoch {epoch+1}, Step {i+1}, Loss: {loss.item():.4f}")

                with open(log_out_path, 'a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow([epoch + 1, i + 1, f"{loss.item():.6f}"])

        # 1エポックごとに保存（上書き）
        torch.save(model.state_dict(), model_out_path)
        print(f"Epoch {epoch+1} のモデルを保存しました。")
    
    return loss.item()