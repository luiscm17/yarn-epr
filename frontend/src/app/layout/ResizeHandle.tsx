import { useCallback, useEffect, useRef } from "react";
import classes from "../../styles/components/ResizeHandle.module.css";

interface ResizeHandleProps {
    onResize: (width: number) => void;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
    minWidth?: number;
    maxWidth?: number;
}

export function ResizeHandle({
    onResize,
    onResizeStart,
    onResizeEnd,
    minWidth = 200,
    maxWidth = 400,
}: ResizeHandleProps) {
    const isDragging = useRef(false);
    const onResizeRef = useRef(onResize);
    const onResizeStartRef = useRef(onResizeStart);
    const onResizeEndRef = useRef(onResizeEnd);
    const minRef = useRef(minWidth);
    const maxRef = useRef(maxWidth);

    // Keep refs in sync without re-attaching listeners
    // useEffect ensures purity: ref mutations must not happen during render
    useEffect(() => {
        onResizeRef.current = onResize;
        onResizeStartRef.current = onResizeStart;
        onResizeEndRef.current = onResizeEnd;
        minRef.current = minWidth;
        maxRef.current = maxWidth;
    }, [onResize, onResizeStart, onResizeEnd, minWidth, maxWidth]);

    const stopDrag = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        onResizeEndRef.current?.();
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.body.style.touchAction = "";
    }, []);

    const doDrag = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        const newWidth = Math.min(Math.max(clientX, minRef.current), maxRef.current);
        onResizeRef.current(newWidth);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => doDrag(e.clientX);
        const handleMouseUp = () => stopDrag();

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            doDrag(e.touches[0].clientX);
        };
        const handleTouchEnd = () => stopDrag();

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [doDrag, stopDrag]);

    const startDrag = useCallback(() => {
        isDragging.current = true;
        onResizeStartRef.current?.();
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
        document.body.style.touchAction = "none";
    }, []);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            startDrag();
        },
        [startDrag],
    );

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            startDrag();
        },
        [startDrag],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                // A single click on the handle doesn't make sense for a drag handle,
                // but the role=button contract requires a keyboard activation path.
                // Toggle to a sensible default position on activation.
                onResize(260);
            }
        },
        [onResize],
    );

    return (
        <button
            type="button"
            className={classes.handle}
            aria-label="Redimensionar sidebar"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
        />
    );
}
