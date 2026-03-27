import { Game } from "../entities/game.entity";


export interface IGamesRepository {
    findById(id:string): Promise<Game>;
    update(game: Game): Promise<Game>;
    create(): Promise<Game>;
}