abstract class BaseStone<T extends SentinelStoneType> {
    constructor(protected _stoneType: T) { }

    get stoneType(): T {
        return this._stoneType;
    }

    get reverseStone(): Stone {
        if (this.stoneType === "BLACK") return Stone.white();
        if (this.stoneType === "WHITE") return Stone.black();
        return Stone.none();
    }

    static none(): Stone { return new Stone("NONE"); }
    static black(): Stone { return new Stone("BLACK"); }
    static white(): Stone { return new Stone("WHITE"); }
}

export class Stone extends BaseStone<StoneType> {
    constructor(protected _stoneType: StoneType) {
        super(_stoneType);
    }
}

export class SentinelStone extends BaseStone<SentinelStoneType> {
    constructor(protected _stoneType: SentinelStoneType) {
        super(_stoneType);
    }

    static wall(): SentinelStone { return new SentinelStone("WALL"); }
}

type StoneType = "BLACK" | "WHITE" | "NONE"
type SentinelStoneType = StoneType | "WALL"


