import torch
import numpy as np
from train_step import train_step

# 学習データを取得する
data = np.load("./data/npz/train_data.npz")

X = torch.from_numpy(data['x']).float()
Y = torch.from_numpy(data['y']).long()
Z = torch.from_numpy(data['z']).float()

# 学習ステップを実行する
train_step(X, Y, Z, 512, 1, 0.00005, "./models/reversi_model.pth", "./logs/training_log.csv")
