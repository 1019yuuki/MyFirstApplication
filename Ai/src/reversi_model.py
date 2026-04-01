import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

class ReversiNet(nn.Module):
    def __init__(self):
        super(ReversiNet, self).__init__()

         # 1. 畳み込み層：4層重ねることで盤面全体(8x8)の相関をカバーする
        # (3ch -> 64ch -> 128ch -> 128ch -> 128ch)
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(128, 128, kernel_size=3, padding=1)
        self.conv4 = nn.Conv2d(128, 128, kernel_size=3, padding=1)
        
        # 2. 全結合層：128枚の「加工済み地図」を1本の棒(8192次元)にして統合判断
        self.fc1 = nn.Linear(128 * 8 * 8, 256)
        self.fc2 = nn.Linear(256, 64) # 最終的な64マスの生スコア

    def forward(self, x):

        # xの形状: (Batch, 3, 8, 8)
        # 入力xの3枚目（合法手フラグ）をマスク用に取り出しておく
        # maskの形状: (Batch, 64) にフラット化
        legal_mask = x[:, 2, :, :].view(-1, 64)
        
        # --- CNN層による特徴抽出 ---
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = F.relu(self.conv4(x))
        
        # --- Flatten & 全結合層 ---
        x = x.view(-1, 128 * 8 * 8)
        x = F.relu(self.fc1(x))
        raw_score = self.fc2(x) # 64マスの「生の打ちたさスコア」
        
        # --- 合法手マスク処理 (ロジックの強制) ---
        stable_mask = legal_mask + 1e-8 
        masked_score = raw_score + (stable_mask - 1.0) * 1e4
        
        # --- Softmaxによる確率化 ---
        # 非合法手は e^(-∞) = 0 となり、確率が厳密に0になる
        return F.log_softmax(masked_score, dim=1)
    