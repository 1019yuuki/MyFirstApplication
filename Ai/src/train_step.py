import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from reversi_model import ReversiNet
from torch.utils.data import TensorDataset, DataLoader
import os
import csv



# 学習ループのシミュレーション
def train_step(boards, teacher_moves, teacher_values, b_size = 128, n_epoch = 1, lerning_rate = 0.001, model_out_path="./models/reversi_model.pth", log_out_path="./logs/training_log.csv"):

    # 学習のセットアップ
    model = ReversiNet()

    if os.path.exists(model_out_path):
        print(f"既存のモデル {model_out_path} を読み込んで学習を再開します...")
        model.load_state_dict(torch.load(model_out_path), strict=False)
    else:
        print("新規モデルで学習を開始します。")

    # 損失関数：Cross Entropy（予測分布と正解分布の距離を測定）
    criterion_policy = nn.NLLLoss(ignore_index=-100) 
    criterion_value = nn.MSELoss()

    # 最適化手法：Adam（各wの学習率を動的に調整する高度な勾配降下法）
    optimizer = optim.Adam(model.parameters(), lr=lerning_rate)


    # 1. 保存先ディレクトリを自動作成
    os.makedirs(os.path.dirname(model_out_path), exist_ok=True)
    os.makedirs(os.path.dirname(log_out_path), exist_ok=True)

        # 2. ログファイルのヘッダー準備
    with open(log_out_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['epoch', 'step', 'loss_p', 'loss_v'])

    model.train() # 学習モードへ

    dataset = TensorDataset(boards, teacher_moves, teacher_values)

    train_loader = DataLoader(dataset, b_size, shuffle=True)


    for epoch in range(n_epoch):

        for i, (inputs, move, value) in enumerate(train_loader):
        
            # --- 順伝播 (Forward) ---
            policy_out, value_out = model(inputs)

            
            # --- 誤差計算 (Loss) ---
            # 正解の場所のlog_probを最大化（Lossを最小化）する
            loss_p = criterion_policy(policy_out, move)
            loss_v = criterion_value(value_out.view(-1), value.view(-1).float())

            loss = (0.1 * loss_p) + (20.0 * loss_v)
            
            # --- 逆伝播 (Backward) ---
            optimizer.zero_grad() # 前の勾配をリセット
            loss.backward()       # 各重みwでの偏微分を実行
            optimizer.step()      # 勾配の反対方向にwを更新

            # 5. 指定されたパスへログを追記
            if i % 50 == 0:
                print(f"Epoch {epoch+1}, Step {i+1}, PolicyLoss: {loss_p.item():.4f}, ValueLoss: {loss_v.item():.4f}")

                with open(log_out_path, 'a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow([
                        epoch + 1, 
                        i + 1, 
                        f"{loss_p.item():.6f}",
                        f"{loss_v.item():.6f}"
                    ])

        # 1エポックごとに保存（上書き）
        torch.save(model.state_dict(), model_out_path)
        print(f"Epoch {epoch+1} のモデルを保存しました。")
    
    return loss.item()