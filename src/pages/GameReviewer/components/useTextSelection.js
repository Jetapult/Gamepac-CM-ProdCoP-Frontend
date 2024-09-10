import { useState, useEffect, useRef } from 'react';

const useTextSelection = (containerRef) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectionInfo, setSelectionInfo] = useState(null);
  const buttonRef = useRef(null);
  const highlightRef = useRef(null);

  // Add a vertical offset (adjust this value as needed)
  const VERTICAL_OFFSET = 50;

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && containerRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const top = rect.top - containerRect.top + containerRef.current.scrollTop + VERTICAL_OFFSET;
      const left = rect.left - containerRect.left;
      const width = rect.width;
      const height = rect.height;

      setSelectedText(selectedText);
      setSelectionInfo({
        text: selectedText,
        top,
        left,
        width,
        height,
        buttonTop: top + height,
        buttonLeft: left + width,
      });
    } else {
      setSelectedText("");
      setSelectionInfo(null);
    }
  };

  const updatePositions = () => {
    if (selectionInfo && buttonRef.current && highlightRef.current && containerRef.current) {
      const scrollTop = containerRef.current.scrollTop + 5;

      // Update button position
      buttonRef.current.style.position = "absolute";
      buttonRef.current.style.top = `${selectionInfo.buttonTop - scrollTop}px`;
      buttonRef.current.style.left = `${selectionInfo.buttonLeft}px`;
      buttonRef.current.style.zIndex = "10";

      // Update highlight position
      highlightRef.current.style.top = `${selectionInfo.top - scrollTop}px`;
      highlightRef.current.style.left = `${selectionInfo.left - 5}px`;
      highlightRef.current.style.width = `${selectionInfo.width + 10}px`;
      highlightRef.current.style.height = `${selectionInfo.height + 10}px`;
      highlightRef.current.style.display = "block";
    } else if (highlightRef.current) {
      // Hide the highlight when there's no selection
      highlightRef.current.style.display = "none";
    }
  };

  useEffect(() => {
    if (selectionInfo && highlightRef.current) {
      highlightRef.current.style.position = "absolute";
      highlightRef.current.style.border = "1px dashed #ff1053";
      highlightRef.current.style.borderRadius = "3px";
      highlightRef.current.style.pointerEvents = "none";
      highlightRef.current.style.backgroundColor = "rgba(255, 16, 83, 0.1)";
      updatePositions();
    } else {
      updatePositions(); // This will hide the highlight when there's no selection
    }
  }, [selectionInfo]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updatePositions);
      return () => container.removeEventListener("scroll", updatePositions);
    }
  }, [selectionInfo]);

  return {
    selectedText,
    selectionInfo,
    buttonRef,
    highlightRef,
    handleTextSelection,
  };
};

export default useTextSelection;