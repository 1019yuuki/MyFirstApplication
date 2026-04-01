FROM python:3.10-slim
WORKDIR /workspace

# 1. 依存パッケージのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. pip自体のアップグレード
RUN pip install --no-cache-dir --upgrade pip

# 3. PyTorchのインストール
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 4. その他のライブラリ
RUN pip install --no-cache-dir pandas matplotlib scikit-learn python-dotenv onnxscript

COPY . .
