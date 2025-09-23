import { useLayoutEffect } from "react";

type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const initial = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

function applyCssVariables(insets: EdgeInsets) {
  const root = document.documentElement;

  root.style.setProperty("--safe-top", `${insets.top}px`);
  root.style.setProperty("--safe-right", `${insets.right}px`);
  root.style.setProperty("--safe-bottom", `${insets.bottom}px`);
  root.style.setProperty("--safe-left", `${insets.left}px`);
}

export default function SafeAreaVars() {
  useLayoutEffect(() => {
    if (!window) return;

    const onSafeArea = (event: Event) => {
      const { detail } = event as CustomEvent<EdgeInsets | undefined>;
      const next = detail ?? initial;

      applyCssVariables(next);
    };

    window.addEventListener("SafeAreaInsets", onSafeArea as EventListener);
    return () => {
      window.removeEventListener("SafeAreaInsets", onSafeArea as EventListener);
    };
  }, []);

  return null;
}
