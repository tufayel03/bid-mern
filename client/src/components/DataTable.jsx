import React from "react";

export function DataTable({ columns, rows, emptyText = "No data found.", rowKey = "id" }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row?.[rowKey] || index)}>
              {columns.map((column) => {
                const value =
                  typeof column.render === "function" ? column.render(row, index) : row?.[column.key];
                return <td key={column.key}>{value ?? "-"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

