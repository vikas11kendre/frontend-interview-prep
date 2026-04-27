import React, { useState, useRef } from "react";
import DisplaySummary from "./DisplaySummary";
import FileSelection from "./FileSelection";

const CsvFileAnalyser = () => {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress,setProgress]=useState(1)
  const workerRef = useRef(null);

  const getSummary = () => {
    if (!data || loading) return;

    // terminate any existing worker
    if (workerRef.current) workerRef.current.terminate();

    const worker = new Worker(
      new URL("../webWorker/fileAnalyser.js", import.meta.url)
    );
    workerRef.current = worker;
    setLoading(true);
    setSummary(null);

    worker.postMessage(data);

    worker.onmessage = (e) => {
        if(e.data.type==="progress"){
            console.log("progress",e.data.processed)
            setProgress(e.data.processed/1000);
        }else{
      setSummary(e.data);
      setLoading(false);
      worker.terminate();
      workerRef.current = null;
        }

    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setLoading(false);
      worker.terminate();
      workerRef.current = null;
    };
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            CSV File Analyser
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload a CSV file to see column stats, missing values, and validation errors.
          </p>
        </header>

        <FileSelection setData={setData} getSummary={getSummary} loading={loading} />

        {loading && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Processing file…</span>
              <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-150"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {summary && <DisplaySummary summary={summary} />}
      </div>
    </div>
  );
};

export default CsvFileAnalyser;

