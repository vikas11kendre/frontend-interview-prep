import React,{useState} from "react";

const FileSelection = ({ setData, getSummary }) => {
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    setData(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="file">
        {fileInfo
          ? `${fileInfo.name} | ${(fileInfo.size / 1024).toFixed(1)}KB | ${fileInfo.type}`
          : "Choose a CSV file"}
      </label>
      <input
        onChange={handleFileChange}
        id="file"
        type="file"
        accept=".csv"
      />
      <button onClick={getSummary}>click here to Get Summary</button>
    </div>
  );
};

export default FileSelection;