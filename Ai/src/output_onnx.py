import torch
from reversi_model import ReversiNet
import onnx
import os

def export_to_onnx(model_path, onnx_out_directory, file_name = "model"):
    model = ReversiNet()
    model.load_state_dict(torch.load(model_path))
    model.eval()

    onnx_work_path = onnx_out_directory + "/" + file_name + ".work.onnx"
    onnx_path = onnx_out_directory + "/" + file_name + ".onnx"

    # ONNX変換には「ダミーの入力データ」が必要です（形状を教えるため）
    dummy_input = torch.randn(1, 5, 8, 8) 

    torch.onnx.export(
        model, 
        dummy_input, 
        onnx_work_path,
        export_params=True,
        opset_version=11,  # 標準的なバージョン
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )

    # 一旦出力されたものを読み込んで、1ファイル（External Dataなし）で保存し直す
    model = onnx.load(onnx_work_path)
    onnx.save(model, onnx_path)
    print(f"ONNXモデルを {onnx_path} に出力しました。")

    # 中間ファイルを削除 
    if os.path.exists(onnx_work_path):
        os.remove(onnx_work_path)
        # もし .data ファイルが生成されていた場合も削除
        data_file = onnx_work_path + ".data"
        if os.path.exists(data_file):
            os.remove(data_file)

# 実行
export_to_onnx("./models/reversi_model.pth", "./models", "reversi_model")
