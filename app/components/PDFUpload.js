"use client";
import React, { useState } from 'react';

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const PDFUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [showColorConfig, setShowColorConfig] = useState(false);
  const [colors, setColors] = useState({
    documentA: '#000000',
    documentB: '#808080'
  });
  const [useDefaultColors, setUseDefaultColors] = useState(true);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (files.length === 0) return;

    const file = files[0];

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setFileName(file.name);

    // Convert file to URL for NutrientViewer
    const fileUrl = URL.createObjectURL(file);
    const comparisonColors = useDefaultColors ? null : {
      documentA: hexToRgb(colors.documentA),
      documentB: hexToRgb(colors.documentB)
    };
    onFileSelect(fileUrl, comparisonColors);
  };

  const handleUseSamplePDF = () => {
    setFileName('nutrient-web-demo.pdf');
    setError('');
    const comparisonColors = useDefaultColors ? null : {
      documentA: hexToRgb(colors.documentA),
      documentB: hexToRgb(colors.documentB)
    };
    onFileSelect('/nutrient-web-demo.pdf', comparisonColors);
  };

  return (
    <div className="pdf-upload-container">
      <div className="pdf-upload-content">
        <h1 className="pdf-upload-title">PDF Viewer</h1>
        <p className="pdf-upload-subtitle">
          Upload a PDF document to view and annotate
        </p>

        {/* Color Configuration Section */}
        <div className="color-config-section">
          <button
            onClick={() => setShowColorConfig(!showColorConfig)}
            className="color-config-toggle"
          >
            {showColorConfig ? '▼' : '▶'} Document Comparison Colors
          </button>

          {showColorConfig && (
            <div className="color-config-content">
              <p className="color-config-description">
                Configure colors for document comparison mode
              </p>
              <div className="color-config-option">
                <label className="color-config-checkbox">
                  <input
                    type="checkbox"
                    checked={useDefaultColors}
                    onChange={(e) => setUseDefaultColors(e.target.checked)}
                  />
                  <span>Use default colors</span>
                </label>
              </div>

              {!useDefaultColors && (
                <div className="color-config-inputs">
                  <div className="color-input-group">
                    <label htmlFor="colorA">Document A:</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        id="colorA"
                        value={colors.documentA}
                        onChange={(e) => setColors({ ...colors, documentA: e.target.value })}
                        className="color-input"
                      />
                      <span className="color-value">{colors.documentA}</span>
                    </div>
                  </div>

                  <div className="color-input-group">
                    <label htmlFor="colorB">Document B:</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        id="colorB"
                        value={colors.documentB}
                        onChange={(e) => setColors({ ...colors, documentB: e.target.value })}
                        className="color-input"
                      />
                      <span className="color-value">{colors.documentB}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`pdf-upload-dropzone ${isDragging ? 'dragging' : ''}`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="pdf-upload-input"
            id="pdf-upload"
          />

          <label htmlFor="pdf-upload" className="pdf-upload-label">
            <img
              src="/icons/pdf-upload.svg"
              alt="Upload PDF"
              className="pdf-upload-icon"
            />

            {fileName ? (
              <div>
                <p className="pdf-upload-selected-text">
                  Selected: {fileName}
                </p>
                <p className="pdf-upload-hint">
                  Click or drag to change
                </p>
              </div>
            ) : (
              <div>
                <p className="pdf-upload-instruction">
                  Drag and drop your PDF here
                </p>
                <p className="pdf-upload-hint">
                  or click to browse
                </p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="pdf-upload-error">
            {error}
          </div>
        )}

        <div className="pdf-upload-divider-container">
          <span className="pdf-upload-divider-text">or</span>
          <button
            onClick={handleUseSamplePDF}
            className="pdf-upload-sample-button"
          >
            Use Sample PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;