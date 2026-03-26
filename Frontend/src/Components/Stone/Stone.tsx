import { type FC } from "react";
import styles from "./Stone.module.css"

export type StoneType = "BLACK" | "WHITE" | "NONE";

interface Props {
    stoneType: StoneType
}

export const Stone: FC<Props> = ({ stoneType }) => {

    const classes: string[] = [styles.stone];

    switch (stoneType) {
        case "BLACK":
            classes.push(styles.blackStone);
            break;
        case "WHITE":
            classes.push(styles.whiteStone);
            break;
        case "NONE":
            classes.push(styles.none);
            break;
    }

    return (
        <div className={classes.join(' ')}></div>
    );
};