const DisplaySummary = ({ summary }) => {
  if (summary.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {summary.error}
      </div>
    );
  }
  if (summary.type === "progress") return null;

  const stats = [
    { label: "Total Rows", value: summary.totalRows, tone: "neutral" },
    { label: "Valid", value: summary.validCount, tone: "green" },
    { label: "Invalid", value: summary.invalidCount, tone: "red" },
  ];

  const toneClasses = {
    neutral: "text-neutral-900 dark:text-neutral-100",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Headers + stats card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Summary</h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Columns:{" "}
          <span className="font-mono text-neutral-700 dark:text-neutral-300">
            {summary.headers.join(", ")}
          </span>
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {s.label}
              </div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneClasses[s.tone]}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing values */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h4 className="text-base font-semibold">Missing values by column</h4>
        {Object.keys(summary.missingByColumn).length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No missing values.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            {Object.entries(summary.missingByColumn).map(([col, count]) => (
              <li key={col} className="flex items-center justify-between py-2">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {col}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    count > 0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Errors table */}
      {summary.errors.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h4 className="text-base font-semibold">
              First {summary.errors.length} errors
            </h4>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              of {summary.totalErrors} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Row</th>
                  <th className="px-5 py-3 font-medium">Column</th>
                  <th className="px-5 py-3 font-medium">Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {summary.errors.map((err, i) => (
                  <tr
                    key={i}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-5 py-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      {err.row}
                    </td>
                    <td className="px-5 py-3 font-mono text-neutral-700 dark:text-neutral-300">
                      {err.column}
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                      {err.issue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplaySummary;
