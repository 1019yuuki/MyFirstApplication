import type { FC, ReactNode } from "react";
import styles from "./Cell.module.css"

interface Props {
    children?: ReactNode
    row: number
    col: number
    handleClick: (row: number, col: number) => void
}

export const Cell: FC<Props> = ({ children, row, col, handleClick }) => {
    return (
        <div className={styles.cell} onClick={() => {handleClick(row, col)}}>{children}</div>
    );
};