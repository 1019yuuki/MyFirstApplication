import styles from "./Table.module.css"

interface Props<T extends object> {
  data: T[];
  columns: TableColumn<T>[];
  onClick?: (row: T) => void
}

export interface TableColumn<T>{
    key: (keyof T)
    name: string
}

export const Table = <T extends object>({ data, columns, onClick = () => {} }: Props<T>) => {
  return (
    <table className={styles.Table}>
      <thead>
        <tr>
            {columns.map(col => (
                <th key={String(col.key)}>{String(col.name)}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
                <td key={String(col.key)} onClick={() => onClick(row)}>{String(row[col.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};