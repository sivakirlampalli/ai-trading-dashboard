import React, { useState } from "react";

export default function CsvUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload result:", data);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error("Error uploading CSV", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-2">Upload CSV Market Data</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
