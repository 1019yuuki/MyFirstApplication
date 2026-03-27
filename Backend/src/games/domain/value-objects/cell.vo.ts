export class Cell {
    private constructor(private readonly _x: number, private readonly _y: number) { }

    static create({ x, y }: { x: number, y: number }): Cell {
        return new Cell(x, y);
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y
    }

    get internal(): Cell {
        return this.move({ x: 1, y: 1 });
    }

    move({ x, y }: { x: number, y: number }): Cell {
        return new Cell(this._x + x, this._y + y);
    }
}