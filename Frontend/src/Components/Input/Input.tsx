import type { ChangeEvent, FC } from "react"
import styles from "./Input.module.css"

export const Input: FC<{ onChange: (e: ChangeEvent<HTMLInputElement>) => void, value: string, placeholder?: string }> = ({ onChange, value, placeholder }) => {
  return (
    <>
      <input className={styles.Input} onChange={onChange} placeholder={placeholder} value={value}></input>
    </>
  )
}
