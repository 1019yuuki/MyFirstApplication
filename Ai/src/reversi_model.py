import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

# 同じ形のまま情報を次に渡す「残差ブロック」
class ResBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual # ここで元の入力を足す（Skip Connection）
        return F.relu(out)

class ReversiNet(nn.Module):


    def __init__(self, num_res_blocks=4): # 2層×4ブロック = 8層のCNN部分
        super().__init__()
        # 入力層 (5ch -> 128ch)
        self.start_conv = nn.Sequential(
            nn.Conv2d(5, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU()
        )
        
        # 中間層（ResBlockを重ねる）
        self.res_blocks = nn.ModuleList([ResBlock(128) for _ in range(num_res_blocks)])
        
        # Policy Head (指し手)
        self.policy_head = nn.Sequential(
            nn.Conv2d(128, 2, kernel_size=1),
            nn.BatchNorm2d(2),
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(2 * 8 * 8, 64),
            # nn.LogSoftmax(dim=1)
        )
        
        # Value Head (勝敗評価)
        self.value_head = nn.Sequential(
            nn.Conv2d(128, 1, kernel_size=1),
            nn.BatchNorm2d(1),
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(1 * 8 * 8, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Tanh()
        )

    def forward(self, x):

        # maskの形状: (Batch, 64) にフラット化
        legal_mask = x[:, 2, :, :].view(-1, 64)

        x = self.start_conv(x)
        for block in self.res_blocks:
            x = block(x)
        
        unmasked = self.policy_head(x)

        # 非合法手の場所に非常に小さい値を足す (Softmax後にほぼ0になる)
        # legal_maskが1の場所は +0、0の場所は -1,000,000,000
        masked_p = unmasked + (legal_mask - 1.0) * 1e9
        policy = F.log_softmax(masked_p, dim=1)

        value = self.value_head(x)
        return policy, value
