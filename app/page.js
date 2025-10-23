"use client";
import React, { useState } from "react";
import PDFUpload from "./components/PDFUpload";
import PDFViewer from "./components/PDFViewer";

export default function Home() {
  const [selectedPDF, setSelectedPDF] = useState(null);

  const handleFileSelect = (fileUrl) => {
    setSelectedPDF(fileUrl);
  };

  const handleBack = () => {
    // Clean up the object URL if it was created from a file
    if (selectedPDF && selectedPDF.startsWith('blob:')) {
      URL.revokeObjectURL(selectedPDF);
    }
    setSelectedPDF(null);
  };

  return (
    <div className="app-container">
      {!selectedPDF ? (
        <PDFUpload onFileSelect={handleFileSelect} />
      ) : (
        <PDFViewer
          documentUrl={selectedPDF}
          onBack={handleBack}
        />
      )}
    </div>
  );
}