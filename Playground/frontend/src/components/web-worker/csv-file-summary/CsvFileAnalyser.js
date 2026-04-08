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
      new URL("../../../webWorker/fileAnalyser.js", import.meta.url)
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
    <div>
      <FileSelection setData={setData} getSummary={getSummary} />
      {loading && <p>Processing file...{progress}%</p>}
      {summary && <DisplaySummary summary={summary} />}
    </div>
  );
};

export default CsvFileAnalyser;

