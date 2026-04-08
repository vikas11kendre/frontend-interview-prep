self.onmessage = (e) => {
  const file = e.data;
  const reader = new FileReader();

  reader.onload = (event) => {
    const text = event.target.result;
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    console.group("webworker",text)

    if (lines.length < 2) {
      postMessage({ error: "File is empty or has no data rows" });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const emailIndex = headers.indexOf("email");
    const totalRows = lines.length - 1;

    const errors = [];
    let validCount = 0;
    const missingByColumn = {};

    headers.forEach((h) => (missingByColumn[h] = 0));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      let rowValid = true;

      // check missing fields
      headers.forEach((header, idx) => {
        if (!values[idx] || values[idx] === "") {
          missingByColumn[header]++;
          rowValid = false;
          errors.push({ row: i + 1, column: header, issue: "missing" });
        }
      });

      // validate email format
      if (emailIndex !== -1 && values[emailIndex]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[emailIndex])) {
          rowValid = false;
          errors.push({
            row: i + 1,
            column: "email",
            issue: "invalid format",
            value: values[emailIndex],
          });
        }
      }

      if (rowValid) validCount++;
      // send progress every 10k rows
      if (i % 10000 === 0) {
        postMessage({
          type: "progress",
          processed: i,
          total: totalRows,
        });
      }
    }

    postMessage({
      type: "result",
      headers,
      totalRows,
      validCount,
      invalidCount: totalRows - validCount,
      missingByColumn,
      errors: errors.slice(0, 100), // first 100 errors only
      totalErrors: errors.length,
    });
  };

  reader.onerror = () => {
    postMessage({ error: "Failed to read file" });
  };

  reader.readAsText(file);
};