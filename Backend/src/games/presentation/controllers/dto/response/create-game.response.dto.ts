import { StoneType } from "src/games/domain/types/stone.type";

export interface CreateGameResponseDto {
    board: StoneType[][],
    nextStone: StoneType,
    gameId: string
}