import { Injectable, NotFoundException } from "@nestjs/common";
import { StoneType } from "generated/prisma/enums";
import { Board } from "src/games/domain/entities/board.model";
import { Game } from "src/games/domain/entities/game.model";
import { Stone } from "src/games/domain/entities/stone.model";
import { IGamesRepository } from "src/games/domain/repositories/games.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class PrismaGamesRepository implements IGamesRepository {

    constructor(private prisma: PrismaService) { }

    async create(): Promise<Game> {
        const created = await this.prisma.game.create({
            data: {
                board: this.ConvertBoardToFlat(Board.getInitialBoard()),
                nextStone: "BLACK"
            }
        })

        return new Game({
            id: created.id,
            board: this.ConvertBoardFromFlat(created.board),
            nextStone: new Stone(created.nextStone),
            version: created.version
        });
    }

    async findById(id: string): Promise<Game> {
        const game = await this.prisma.game.findUnique({
            where: {
                id
            }
        })

        if (!game) {
            throw new NotFoundException("Game is not exists.");
        }

        return new Game({
            id: game.id,
            board: this.ConvertBoardFromFlat(game.board),
            nextStone: new Stone(game.nextStone),
            version: game.version
        });
    }

    async update({ id, board, nextStone, version }: Game): Promise<Game> {

        const updated = await this.prisma.game.update({
            where: {
                id,
                version
            },
            data: {
                board: this.ConvertBoardToFlat(board),
                nextStone: nextStone.stoneType,
                version: version++
            }
        });

        return new Game({
            id: updated.id,
            board: this.ConvertBoardFromFlat(updated.board),
            nextStone: new Stone(updated.nextStone),
            version: updated.version
        });
    }

    private ConvertBoardToFlat(board: Board): StoneType[] {
        return board.grid.flat().map((stone) => stone.stoneType);
    }

    private ConvertBoardFromFlat(flatBoard: StoneType[]): Board {

        let index: number = 0;
        let row: Stone[] = [];
        const result: Stone[][] = [];
        flatBoard.forEach((cell) => {
            row.push(new Stone(cell));

            if (index === 7) {
                result.push(row);
                index = 0;
                row = [];
            }
            else {
                index++;
            }
        });

        return new Board(result);
    }
}