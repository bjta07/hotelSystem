import React from 'react'

const UserTable = ({ columns, data, actions }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
          {actions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={idx}>
            {columns.map((col, i) => (
              <td key={i}>{item[col.toLowerCase()]}</td>
            ))}
            {actions && (
              <td>
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => action.onClick(item)}
                  >
                    {action.label}
                  </button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserTable
