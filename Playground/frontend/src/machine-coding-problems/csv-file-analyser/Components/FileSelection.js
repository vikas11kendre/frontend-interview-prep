import { useState } from "react";

const FileSelection = ({ setData, getSummary, loading }) => {
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    setData(file);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Choose CSV
          </label>
          <input
            onChange={handleFileChange}
            id="file"
            type="file"
            accept=".csv"
            className="sr-only"
          />
          <div className="min-w-0 text-sm">
            {fileInfo ? (
              <div className="flex flex-col">
                <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                  {fileInfo.name}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(fileInfo.size / 1024).toFixed(1)} KB · {fileInfo.type || "text/csv"}
                </span>
              </div>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400">
                No file selected
              </span>
            )}
          </div>
        </div>

        <button
          onClick={getSummary}
          disabled={!fileInfo || loading}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500"
        >
          {loading ? "Analysing…" : "Get Summary"}
        </button>
      </div>
    </div>
  );
};

export default FileSelection;
