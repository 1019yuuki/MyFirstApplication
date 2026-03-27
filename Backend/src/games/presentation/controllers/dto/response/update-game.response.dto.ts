import { StoneType } from "generated/prisma/enums";

export interface UpdateGameResponseDto {
    board: StoneType[][],
    nextStone: StoneType
}