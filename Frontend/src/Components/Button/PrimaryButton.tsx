import type { FC, ReactNode } from "react"
import styles from "./PrimaryButton.module.css"

export const PrimaryButton: FC<{ children: ReactNode, onClick: () => void }> = ({ children, onClick }) => {
  return (
    <>
      <button className={styles.PrimaryButton} onClick={onClick}>{children}</button>
    </>
  )
}
