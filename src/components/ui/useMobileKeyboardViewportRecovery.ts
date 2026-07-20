import { type RefObject, useCallback, useEffect, useRef } from "react";

/** Restores a full-screen surface after iOS leaves its visual viewport offset on keyboard close. */
export function useMobileKeyboardViewportRecovery(containerRef: RefObject<HTMLElement | null>) {
  const scrollBeforeKeyboard = useRef<number | null>(null);
  const keyboardWasVisible = useRef(false);

  const restore = useCallback(async () => {
    const container = containerRef.current;
    const apply = () => {
      if (container && scrollBeforeKeyboard.current !== null) container.scrollTop = scrollBeforeKeyboard.current;
      window.scrollTo(0, 0);
    };
    (document.activeElement instanceof HTMLElement ? document.activeElement : null)?.blur();
    apply();
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => { apply(); resolve(); })));
    window.setTimeout(apply, 80);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    const viewport = window.visualViewport;
    if (!container || !viewport) return;
    const isEditable = (target: EventTarget | null) => target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable='true']");
    const onFocusIn = (event: FocusEvent) => { if (isEditable(event.target)) scrollBeforeKeyboard.current = container.scrollTop; };
    const onViewportResize = () => {
      if (viewport.height < window.innerHeight - 100) { keyboardWasVisible.current = true; return; }
      if (!keyboardWasVisible.current || scrollBeforeKeyboard.current === null) return;
      keyboardWasVisible.current = false;
      void restore();
    };
    container.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("resize", onViewportResize);
    return () => { container.removeEventListener("focusin", onFocusIn); viewport.removeEventListener("resize", onViewportResize); };
  }, [containerRef, restore]);

  return restore;
}
