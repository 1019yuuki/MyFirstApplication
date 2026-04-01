import numpy as np

WALL = 99

def get_flip_points(board, row, col, player):

    # すでに石がある場合はエラー（NestJSの例外処理に相当）
    if board[row, col] != 0:
        # 学習データ作成中はエラーを出すより、空リストを返すのが一般的です
        return []
    
    sentinel_board = add_sentinel(board)

    sentinel_row = row + 1
    sentinel_col = col + 1
    
    # 相手の石の色 (1なら-1, -1なら1)
    reverse_player = -player

    # 探索方向の定義
    directions = [
        (-1, 0), (1, 0), (0, -1), (0, 1),   # 上下左右
        (-1, -1), (-1, 1), (1, -1), (1, 1)  # 斜め
    ]

    flip_points = []

    # 各方向へ探索する
    for dir_row, dir_col in directions:
        work_r, work_c = sentinel_row + dir_row, sentinel_col + dir_col
        work_flip_points = []

        # 隣のセルが相手の石（reverse_stone）でなければ、その方向の探索を終了
        if sentinel_board[work_r, work_c] != reverse_player:
            continue

        # 相手の石が続く限り、その方向へ進む
        # ※番兵(WALL)に当たるとこの条件が False になるので、ループが自動で止まります
        while sentinel_board[work_r, work_c] == reverse_player:
            work_flip_points.append((work_r, work_c))
            work_r += dir_row
            work_c += dir_col

        # 突き当たった先（対向先）が自分の石であれば、リストに追加
        if sentinel_board[work_r, work_c] == player:
            flip_points.extend(work_flip_points)

    # 番兵分を除いた番地を返却する
    return [(row - 1, col - 1) for row, col in flip_points]

def add_sentinel(board):
    return np.pad(board, pad_width=1, mode='constant', constant_values=WALL)


def can_place_stone(board, player):

    # 8x8の範囲をループで回す
    for row in range(8):
        for col in range(8):
            # 1. すでに石がある場所はスキップ (isEmpty チェック)
            if board[row, col] != 0:
                continue
            
            # 2. その場所に置いたときに裏返る石があるかチェック
            # 1つでも見つかれば、その時点で True を返して終了 (some に相当)
            if len(get_flip_points(board, row, col, player)) > 0:
                return True
                
    # 全マス調べても見つからなければ False
    return False

def get_putable_points(board, player):

    putable_points = []

    # 実際の盤面範囲を走査
    for row in range(8):
        for col in range(8):
            # 1. 空きマスであること (isEmpty)
            if board[row, col] != 0:
                continue
            
            # 2. 裏返せる石が1つ以上あること
            if len(get_flip_points(board, row, col, player)) > 0:
                putable_points.append((row, col))
                
    return putable_points

def get_next_player(board, current_player):

    # 1. 相手が打てるかチェック
    opponent = -current_player
    if can_place_stone(add_sentinel(board), opponent):
        return opponent
        
    # 2. 相手が打てない場合、自分が続けて打てるかチェック (パス発生)
    if can_place_stone(add_sentinel(board), current_player):
        return current_player
        
    # 3. どちらも打てない場合は終局
    return 0

def get_legal_moves_mask(board, player):

    # 1. 既存のロジックで合法手の座標リストを取得
    legal_coords = get_putable_points(board, player)
    
    # 2. 8x8 のゼロ行列を用意
    mask = np.zeros((8, 8), dtype=np.float32)
    
    # 3. 合法手の座標だけに 1.0 を立てる
    for row, col in legal_coords:
        mask[row, col] = 1.0
        
    return mask

import numpy as np

def update_board(board, player, row, col):

    flip_points = get_flip_points(board, row, col, player)

    new_board = board.copy()

    # 2. 新しく打った場所に石を置く
    new_board[row, col] = player

    # 3. 裏返る地点(flip_points)の石をすべて自分の色にする
    # NestJSの cells.map(...) に相当
    for flip_row, flip_col in flip_points:
        new_board[flip_row, flip_col] = player

    return new_board
