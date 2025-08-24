import { useCallback } from "react";
import { CONSTANTS } from "../utils/constants";

export const useTextarea = () => {
  const handleTextareaChange = useCallback((e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, CONSTANTS.MAX_TEXTAREA_HEIGHT) + 'px';
  }, []);

  const resetTextareaHeight = useCallback(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = CONSTANTS.MIN_TEXTAREA_HEIGHT + 'px';
    }
  }, []);

  return {
    handleTextareaChange,
    resetTextareaHeight
  };
};
