import type { FC } from "react";
import { Cell } from "../Cell/Cell";
import { Stone, type StoneType } from "../Stone/Stone";
import styles from "./Board.module.css"

export const initBoard: StoneType[][] = [
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
    ["NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE", "NONE"],
]

interface Props {
    board: StoneType[][]
    handleClick: (row: number, col:number) => void
}


export const Board: FC<Props> = ({ board, handleClick }) => {

    return (
        <div className={styles.board}>
            {board.map((row, rowIndex) => {
                return row.map((cell, colIndex) => {
                    return <Cell key={rowIndex + ":" + colIndex} row={rowIndex} col={colIndex} handleClick={() => handleClick(rowIndex, colIndex)}><Stone stoneType={cell}></Stone></Cell>
                })
            })}
        </div>
    );
};