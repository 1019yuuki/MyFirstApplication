import { Game } from "../entities/game.model";


export interface IGamesRepository {
    findById(id:string): Promise<Game>;
    update(game: Game): Promise<Game>;
    create(): Promise<Game>;
}