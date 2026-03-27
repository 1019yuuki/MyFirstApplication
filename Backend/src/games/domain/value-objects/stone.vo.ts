import { InternalStoneType, StoneType } from "../types/stone.type";

export class Stone {
    private constructor(private readonly _type: InternalStoneType) { }

    get internalType(): InternalStoneType {
        return this._type;
    }

    get type(): StoneType {
        if (this._type === "WALL") { throw Error("StoneType is not defined."); }
        return this._type;
    }

    get reverseStone(): Stone {
        switch (this._type) {
            case "BLACK":
                return new Stone("WHITE");
            case "WHITE":
                return new Stone("BLACK");
            case "NONE":
            case "WALL":
                return this;
        }
    }

    isEmpty(): boolean {
        return this._type === "NONE";
    }

    isWall(): boolean {
        return this._type === "WALL";
    }

    isBlack(): boolean {
        return this._type === "BLACK";
    }

    isWhite(): boolean {
        return this._type === "WHITE";
    }

    equal(compare: Stone): boolean {
        return this._type === compare._type
    }

    static black(): Stone {
        return new Stone("BLACK");
    }

    static white(): Stone {
        return new Stone("WHITE");
    }

    static none(): Stone {
        return new Stone("NONE");
    }

    static wall(): Stone {
        return new Stone("WALL");
    }
}
