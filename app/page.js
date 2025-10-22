"use client";
import React, { useState } from "react";
import PDFUpload from "./components/PDFUpload";
import PDFViewer from "./components/PDFViewer";

export default function Home() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [comparisonColors, setComparisonColors] = useState({
    documentA: null,
    documentB: null
  });

  const handleFileSelect = (fileUrl, colors) => {
    setSelectedPDF(fileUrl);
    if (colors) {
      setComparisonColors(colors);
    }
  };

  const handleBack = () => {
    // Clean up the object URL if it was created from a file
    if (selectedPDF && selectedPDF.startsWith('blob:')) {
      URL.revokeObjectURL(selectedPDF);
    }
    setSelectedPDF(null);
    setComparisonColors({ documentA: null, documentB: null });
  };

  return (
    <div className="app-container">
      {!selectedPDF ? (
        <PDFUpload onFileSelect={handleFileSelect} />
      ) : (
        <PDFViewer
          documentUrl={selectedPDF}
          onBack={handleBack}
          comparisonColors={comparisonColors}
        />
      )}
    </div>
  );
}