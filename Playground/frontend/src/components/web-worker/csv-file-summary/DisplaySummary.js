import React from "react";

const DisplaySummary = ({ summary }) => {
  if (summary.error) return <p style={{ color: "red" }}>{summary.error}</p>;
  if (summary.type === "progress") return null;

  return (
    <div>
      <h3>Summary</h3>
      <p>Columns: {summary.headers.join(", ")}</p>
      <p>Total Rows: {summary.totalRows}</p>
      <p>Valid: {summary.validCount}</p>
      <p>Invalid: {summary.invalidCount}</p>

      <h4>Missing values by column</h4>
      <ul>
        {Object.entries(summary.missingByColumn).map(([col, count]) => (
          <li key={col}>{col}: {count}</li>
        ))}
      </ul>

      {summary.errors.length > 0 && (
        <>
          <h4>First {summary.errors.length} errors (of {summary.totalErrors})</h4>
          <table>
            <thead>
              <tr><th>Row</th><th>Column</th><th>Issue</th></tr>
            </thead>
            <tbody>
              {summary.errors.map((err, i) => (
                <tr key={i}>
                  <td>{err.row}</td>
                  <td>{err.column}</td>
                  <td>{err.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DisplaySummary;