"use client";
import React, { useEffect, useRef, useState } from "react";

// Tool configuration
const TOOLS = [
  { id: 'select', icon: '/icons/select.svg', label: 'Select', mode: 'MULTI_ANNOTATIONS_SELECTION' },
  { id: 'hand', icon: '/icons/hand.svg', label: 'Hand Tool', mode: 'PAN' },
  { id: 'text', icon: '/icons/text.svg', label: 'Text', mode: 'TEXT' },
  { id: 'highlight', icon: '/icons/highlight.svg', label: 'Highlight', mode: 'TEXT_HIGHLIGHTER' },
  { id: 'note', icon: '/icons/note.svg', label: 'Note', mode: 'NOTE' },
  { id: 'line', icon: '/icons/line.svg', label: 'Line', mode: 'SHAPE_LINE' },
  { id: 'polygon', icon: '/icons/polygon.svg', label: 'Polygon', mode: 'SHAPE_POLYGON' },
  { id: 'rectangle', icon: '/icons/rectangle.svg', label: 'Rectangle', mode: 'SHAPE_RECTANGLE' },
  { id: 'ellipse', icon: '/icons/ellipse.svg', label: 'Ellipse', mode: 'SHAPE_ELLIPSE' },
  { id: 'measurement', icon: '/icons/measurement.svg', label: 'Measurement', mode: 'MEASUREMENT' },
  { id: 'measurement_settings', icon: '/icons/measurement_settings.svg', label: 'Measurement Settings', mode: 'MEASUREMENT_SETTINGS' },
];

// Create mapping from interaction mode to tool ID
const createModeToToolMap = (NutrientViewer) => {
  const map = {};
  TOOLS.forEach(tool => {
    const mode = NutrientViewer.InteractionMode[tool.mode];
    if (mode) {
      map[mode] = tool.id;
    }
  });
  return map;
};

// Get interaction mode for a tool
const getInteractionMode = (NutrientViewer, toolId) => {
  const tool = TOOLS.find(t => t.id === toolId);
  return tool ? NutrientViewer.InteractionMode[tool.mode] : null;
};

// Toggle tool activation
const toggleTool = (instance, NutrientViewer, toolId) => {
  if (!instance) return;

  const targetMode = getInteractionMode(NutrientViewer, toolId);
  const currentMode = instance.viewState.get("interactionMode");

  if (currentMode === targetMode) {
    // Deactivate current tool
    instance.setViewState(viewState => viewState.set("interactionMode", null));
  } else {
    // Activate new tool
    instance.setViewState(viewState => viewState.set("interactionMode", targetMode));
  }
};

// Toolbar Button Component
const ToolbarButton = ({ tool, isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      title={tool?.label}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
    >
      {children || (
        <img
          src={tool.icon}
          alt={tool.label}
          className="toolbar-button-icon"
        />
      )}
    </button>
  );
};

// Document Comparison Button Component
const ComparisonButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Compare Documents"
      className="toolbar-button"
    >
      <img
        src="/icons/compare.svg"
        alt="Compare Documents"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Back button component for toolbar
const ToolbarBackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Back to Upload"
      className="toolbar-button toolbar-back-button"
    >
      <img
        src="/icons/back-arrow.svg"
        alt="Back"
        className="toolbar-button-icon"
      />
    </button>
  );
};

// Vertical Toolbar Component
const VerticalToolbar = ({ tools, activeTool, onToolClick, onCompareClick, onBack }) => {
  return (
    <div className="toolbar-container">
      <ToolbarBackButton onClick={onBack} />
      <div className="toolbar-separator" />
      {tools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool}
          isActive={activeTool === tool.id}
          onClick={() => onToolClick(tool.id)}
        />
      ))}
      <div className="toolbar-separator" />
      <ComparisonButton onClick={onCompareClick} />
    </div>
  );
};

const PDFViewer = ({ documentUrl, onBack, comparisonColors }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    const { NutrientViewer } = window;

    if (!container || !NutrientViewer) return;

    setIsLoading(true);
    setError(null);

    NutrientViewer.load({
      container,
      document: documentUrl,
      licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY,
    }).then((instance) => {
      instanceRef.current = instance;
      setIsLoading(false);

      // Hide default toolbar
      instance.setViewState(viewState => viewState.set("showToolbar", false));

      // Sync toolbar state with viewer state changes
      const modeToToolMap = createModeToToolMap(NutrientViewer);
      instance.addEventListener("viewState.change", (viewState) => {
        const currentMode = viewState.get("interactionMode");
        const toolId = modeToToolMap[currentMode] || null;
        setActiveTool(toolId);
      });
    }).catch((err) => {
      console.error("Failed to load PDF:", err);
      setError("Failed to load PDF. Please try again.");
      setIsLoading(false);
    });

    return () => {
      NutrientViewer?.unload(container);
    };
  }, [documentUrl]);

  const handleToolClick = (toolId) => {
    const { NutrientViewer } = window;
    toggleTool(instanceRef.current, NutrientViewer, toolId);
  };

  const handleCompareDocuments = () => {
    const instance = instanceRef.current;
    const { NutrientViewer } = window;

    if (!instance || !NutrientViewer) return;

    // Build comparison config
    const comparisonConfig = {
      documentA: {
        source: NutrientViewer.DocumentComparisonSourceType.USE_OPEN_DOCUMENT
      },
      documentB: {
        source: NutrientViewer.DocumentComparisonSourceType.USE_FILE_DIALOG
      },
      autoCompare: false
    };

    // Add stroke colors only if they were configured
    if (comparisonColors && (comparisonColors.documentA || comparisonColors.documentB)) {
      comparisonConfig.strokeColors = {};

      if (comparisonColors.documentA) {
        comparisonConfig.strokeColors.documentA = new NutrientViewer.Color(comparisonColors.documentA);
      }

      if (comparisonColors.documentB) {
        comparisonConfig.strokeColors.documentB = new NutrientViewer.Color(comparisonColors.documentB);
      }
    }

    // Set document comparison mode
    instance.setDocumentComparisonMode(comparisonConfig).catch((err) => {
      console.error("Failed to enter comparison mode:", err);
    });
  };

  if (error) {
    return (
      <div className="pdf-viewer-error-container">
        <p className="pdf-viewer-error-text">{error}</p>
        <button
          onClick={onBack}
          className="pdf-viewer-error-button"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {!isLoading && (
        <VerticalToolbar
          tools={TOOLS}
          activeTool={activeTool}
          onToolClick={handleToolClick}
          onCompareClick={handleCompareDocuments}
          onBack={onBack}
        />
      )}
      <div ref={containerRef} className="pdf-viewer-content" />
      {isLoading && (
        <div className="pdf-viewer-loading">
          Loading PDF...
        </div>
      )}
    </div>
  );
};

export default PDFViewer;