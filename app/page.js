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
const toggleTool = (instance, NutrientViewer, toolId, currentActiveTool, setActiveTool) => {
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
const ToolbarButton = ({ tool, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundColor = () => {
    if (isActive) return '#3498db';
    if (isHovered) return '#4a5f7f';
    return '#34495e';
  };

  return (
    <button
      onClick={onClick}
      title={tool.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '48px',
        height: '48px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={tool.icon}
        alt={tool.label}
        style={{
          width: '24px',
          height: '24px',
          filter: 'invert(1)',
        }}
      />
    </button>
  );
};

// Vertical Toolbar Component
const VerticalToolbar = ({ tools, activeTool, onToolClick }) => {
  return (
    <div style={{
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1000,
      backgroundColor: '#2c3e50',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      {tools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool}
          isActive={activeTool === tool.id}
          onClick={() => onToolClick(tool.id)}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    const { NutrientViewer } = window;

    if (!container || !NutrientViewer) return;

    NutrientViewer.load({
      container,
      document: "nutrient-web-demo.pdf",
      licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY,
    }).then((instance) => {
      instanceRef.current = instance;

      // Hide default toolbar
      instance.setViewState(viewState => viewState.set("showToolbar", false));

      // Sync toolbar state with viewer state changes
      const modeToToolMap = createModeToToolMap(NutrientViewer);
      instance.addEventListener("viewState.change", (viewState) => {
        const currentMode = viewState.get("interactionMode");
        const toolId = modeToToolMap[currentMode] || null;
        setActiveTool(toolId);
      });
    });

    return () => {
      NutrientViewer?.unload(container);
    };
  }, []);

  const handleToolClick = (toolId) => {
    const { NutrientViewer } = window;
    toggleTool(instanceRef.current, NutrientViewer, toolId, activeTool, setActiveTool);
  };

  return (
    <div style={{ position: 'relative', height: "100vh", width: "100%" }}>
      <VerticalToolbar
        tools={TOOLS}
        activeTool={activeTool}
        onToolClick={handleToolClick}
      />
      <div ref={containerRef} style={{ height: "100vh", width: "100%" }} />
    </div>
  );
}