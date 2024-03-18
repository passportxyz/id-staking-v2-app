import React from "react";
import { atom, useAtom } from "jotai";

// Don't use these directly, just drop
// <BackdropEnabler /> in your component tree
const backdropEnabledCountAtom = atom<number>(0);
const useBackdropControls = () => {
  const [backdropEnabledCount, setBackdropEnabledCount] = useAtom(backdropEnabledCountAtom);

  const enableBackdrop = () => {
    setBackdropEnabledCount((c) => c + 1);
  };

  const disableBackdrop = () => {
    setBackdropEnabledCount((c) => c - 1);
  };

  const enabled = backdropEnabledCount > 0;

  return { enabled, enableBackdrop, disableBackdrop };
};

// Put this in the component tree in a component that,
// when mounted, should enable the backdrop
// <BackdropEnabler />
export const BackdropEnabler = () => {
  const { enableBackdrop, disableBackdrop } = useBackdropControls();

  React.useEffect(() => {
    // Enable the backdrop when mounted
    enableBackdrop();
    // Disable the backdrop when unmounted
    return disableBackdrop;
  }, [enableBackdrop, disableBackdrop]);

  return null;
};

// Put this in the component tree at the spot
// where the backdrop should be rendered
// (probably towards the root of the app)
export const Backdrop = () => {
  const { enabled } = useBackdropControls();

  return (
    <div
      className={`fixed pointer-events-none ${
        enabled ? "opacity-100" : "opacity-0"
      } transition-opacity  inset-0 bg-background/30`}
      aria-hidden="true"
    />
  );
};
