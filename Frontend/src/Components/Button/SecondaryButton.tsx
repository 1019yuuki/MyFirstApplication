import type { FC, ReactNode } from "react"
import styles from "./SecondaryButton.module.css"

export const SecondaryButton: FC<{ children: ReactNode, onClick: () => void }> = ({ children, onClick }) => {
  return (
    <>
      <button className={styles.SecondaryButton} onClick={onClick}>{children}</button>
    </>
  )
}
