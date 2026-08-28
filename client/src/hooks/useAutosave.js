import { useState, useEffect, useRef, useCallback } from 'react';

// States: 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
export const useAutosave = ({
  initialContent,
  initialTitle,
  onSave, // async function returning a promise
  debounceMs = 1200
}) => {
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSavedState, setLastSavedState] = useState({ title: initialTitle, content: initialContent });
  
  // Refs for tracking across renders without triggering effects prematurely
  const currentStateRef = useRef({ title: initialTitle, content: initialContent });
  const timerRef = useRef(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(null); // Queue for edits that happen during a save

  // Initialize state when the note changes (identified by caller)
  useEffect(() => {
    setSaveStatus('saved');
    setLastSavedState({ title: initialTitle, content: initialContent });
    currentStateRef.current = { title: initialTitle, content: initialContent };
    isSavingRef.current = false;
    pendingSaveRef.current = null;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [initialContent, initialTitle]);

  const performSave = useCallback(async (stateToSave) => {
    isSavingRef.current = true;
    setSaveStatus('saving');
    
    try {
      await onSave(stateToSave.title, stateToSave.content);
      
      // Update last saved
      setLastSavedState({ title: stateToSave.title, content: stateToSave.content });
      
      // Check queue
      if (pendingSaveRef.current) {
        // Someone edited while we were saving! Save the queued changes immediately.
        const nextState = pendingSaveRef.current;
        pendingSaveRef.current = null;
        // Recursive call without breaking promise chain or stack limits (using setTimeout 0)
        setTimeout(() => performSave(nextState), 0);
      } else {
        isSavingRef.current = false;
        
        // Are we still visually in sync with the current editor?
        // Note: the editor might have changed `currentStateRef.current` without triggering pendingSaveRef yet 
        // (if it was within the debounce window). The normal debounce timer will catch that.
        setSaveStatus('saved');
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'The user aborted a request.') {
        isSavingRef.current = false;
        // Do nothing on abort, the next save handles it
      } else {
        isSavingRef.current = false;
        setSaveStatus('error');
      }
    }
  }, [onSave]);

  const triggerManualSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const currentState = currentStateRef.current;
    
    // Check if we actually need to save
    if (currentState.title === lastSavedState.title && currentState.content === lastSavedState.content) {
      setSaveStatus('saved');
      return;
    }
    
    if (isSavingRef.current) {
      pendingSaveRef.current = currentState;
    } else {
      performSave(currentState);
    }
  }, [lastSavedState, performSave]);

  const handleEdit = useCallback((newTitle, newContent) => {
    currentStateRef.current = { title: newTitle, content: newContent };
    
    if (newTitle === lastSavedState.title && newContent === lastSavedState.content) {
      setSaveStatus('saved');
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    // Do not overwrite saving/error states with 'dirty' immediately if a save is in progress,
    // but if it's idle or saved, switch to dirty.
    setSaveStatus(prev => {
      if (prev === 'saved' || prev === 'idle') return 'dirty';
      return prev; // keep 'saving' or 'error' on screen while user edits
    });

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const stateToSave = currentStateRef.current;
      if (isSavingRef.current) {
        pendingSaveRef.current = stateToSave;
      } else {
        performSave(stateToSave);
      }
    }, debounceMs);
  }, [debounceMs, lastSavedState, performSave]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    saveStatus,
    handleEdit,
    triggerManualSave
  };
};
