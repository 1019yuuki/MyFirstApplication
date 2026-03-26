import { type FC, type ReactNode } from "react";
import styles from "./Modal.module.css"
import { SecondaryButton } from "../Button/SecondaryButton";
import { PrimaryButton } from "../Button/PrimaryButton";

interface Props {
    children: ReactNode
    title: string
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    buttons?: ModalButton[]
}

export interface ModalButton {
  text: string
  onClick: () => void
}

export const Modal: FC<Props> = ({ title, children, buttons, isOpen, setIsOpen }) => {


    const buttonWidth = 100 / ((buttons?.length ?? 0) + 1);
    console.log(buttonWidth);

    return (
        isOpen &&
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <hr />
                {children}
                <div className={styles.modalButtonArea}>
                    {buttons && buttons.map((button, index) => (
                        <div style={{ width: buttonWidth.toString() + "%", margin: "0px 5px" }}>
                            <PrimaryButton key={index} onClick={button.onClick}>{button.text}</PrimaryButton>
                        </div>
                    ))}
                    <div style={{ width: buttonWidth.toString() + "%", margin: "0px 5px" }}>
                        <SecondaryButton onClick={() => setIsOpen(false)}>閉じる</SecondaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};