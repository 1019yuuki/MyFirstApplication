import { type FC, type ReactNode } from "react";
import styles from "./modalOverlay.module.css"

interface Props {
    children: ReactNode
    isOpen: boolean
}

export interface ModalButton {
  text: string
  onClick: () => void
}

export const ModalOverlay: FC<Props> = ({ children, isOpen }) => {

    return (
        isOpen &&
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    );
};