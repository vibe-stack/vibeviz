import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DragInputProps {
  value?: number;
  onChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
  step?: number;
  precision?: number;
  min?: number;
  id?: string;
  max?: number;
  className?: string;
  label?: string;
  suffix?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function DragInput({
  value,
  onChange,
  onValueCommit,
  step = 0.01,
  precision = 1,
  min,
  max,
  id,
  className,
  label,
  suffix,
  disabled = false,
  compact = false,
}: DragInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toFixed(precision) ?? "");
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastValueRef = useRef<number | undefined>(value);

  useEffect(() => {
    if (!isEditing && !isDragging && value !== undefined) {
      setInputValue(value.toFixed(precision));
    }
  }, [value, precision, isEditing, isDragging]);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    document.body.style.cursor = "ew-resize";
    const iframes = Array.from(document.querySelectorAll("iframe"));
    for (const iframe of iframes) {
      iframe.style.pointerEvents = "none";
    }

    return () => {
      document.body.style.cursor = "default";
      for (const iframe of iframes) {
        iframe.style.pointerEvents = "auto";
      }
    };
  }, [isDragging]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - dragStartX;
      if (Math.abs(deltaX) > 2) {
        setHasDragged(true);
      }

      const deltaValue = deltaX * step;
      let newValue = dragStartValue + deltaValue;

      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);

      lastValueRef.current = newValue;
      onChange(newValue);
    },
    [dragStartValue, dragStartX, isDragging, max, min, onChange, step],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    window.setTimeout(() => {
      setHasDragged(false);
    }, 0);

    if (onValueCommit) {
      const committed = lastValueRef.current ?? value ?? dragStartValue;
      onValueCommit(committed);
    }
  }, [dragStartValue, onValueCommit, value]);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  const handleInputBlur = useCallback(() => {
    const parsed = Number.parseFloat(inputValue);
    if (Number.isNaN(parsed)) {
      setIsEditing(false);
      setInputValue(value?.toFixed(precision) ?? "");
      return;
    }

    let finalValue = parsed;
    if (min !== undefined) finalValue = Math.max(min, finalValue);
    if (max !== undefined) finalValue = Math.min(max, finalValue);
    onChange(finalValue);
    if (onValueCommit) onValueCommit(finalValue);
    setIsEditing(false);
  }, [inputValue, max, min, onChange, onValueCommit, precision, value]);

  const toggleEditing = useCallback(() => {
    if (disabled) return;

    if (isEditing) {
      handleInputBlur();
    } else {
      setIsEditing(true);
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [disabled, handleInputBlur, isEditing]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isEditing || disabled) return;

      setIsDragging(true);
      setHasDragged(false);
      setDragStartX(event.clientX);
      setDragStartValue(value ?? 0);
      lastValueRef.current = value ?? 0;
      event.preventDefault();
    },
    [disabled, isEditing, value],
  );

  const handleClick = useCallback(() => {
    if (!hasDragged && !disabled) {
      toggleEditing();
    }
  }, [disabled, hasDragged, toggleEditing]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleEditing();
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        setIsEditing(true);
        setInputValue(event.key);
        window.setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(1, 1);
        }, 0);
      }
    },
    [disabled, toggleEditing],
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleInputBlur();
      } else if (event.key === "Escape") {
        setInputValue(value?.toFixed(precision) ?? "");
        setIsEditing(false);
      }
    },
    [handleInputBlur, precision, value],
  );

  return (
    <div
      className={cn(
        "flex min-w-0 w-full items-center gap-1 overflow-hidden",
        className,
      )}
    >
      {label ? (
        <span
          className={cn(
            "flex-shrink-0 text-xs text-zinc-400",
            compact ? "min-w-0" : "min-w-[40px]",
          )}
        >
          {label}
        </span>
      ) : null}
      {isEditing ? (
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          className={cn(
            "h-6 min-w-0 flex-1 rounded border px-2 text-xs focus:outline-none",
            compact ? "w-14" : "w-24",
            disabled
              ? "cursor-not-allowed border-zinc-700/30 bg-zinc-800/50 text-zinc-500"
              : "border-gray-500/30 bg-gray-500/10 text-gray-300 focus:border-gray-500",
          )}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-6 min-w-0 flex-1 select-none items-center justify-between rounded border px-2 text-xs transition-colors",
            compact ? "w-14" : "w-24",
            disabled
              ? "cursor-not-allowed border-zinc-700/30 bg-zinc-800/50 text-zinc-500"
              : "cursor-ew-resize border-zinc-700/50 bg-black/20 text-zinc-300 hover:border-gray-500/30 focus:border-gray-500/50 focus:outline-none",
            isDragging && !disabled && "border-gray-500/30 bg-gray-500/10",
          )}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span className="truncate">{value?.toFixed(precision) ?? ""}</span>
          {suffix ? (
            <span className="ml-1 flex-shrink-0 text-zinc-500">{suffix}</span>
          ) : null}
        </button>
      )}
    </div>
  );
}
