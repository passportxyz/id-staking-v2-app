import React from "react";
import { atom, useAtom } from "jotai";

const backdropEnabledCountAtom = atom<number>(0);

export const useBackdropControls = () => {
  const [backdropEnabledCount, setBackdropEnabledCount] = useAtom(backdropEnabledCountAtom);

  const enableBackdrop = () => {
    setBackdropEnabledCount((c) => c + 1);
  };

  const disableBackdrop = () => {
    setBackdropEnabledCount((c) => c - 1);
  };

  const enabled = backdropEnabledCount > 0;

  return { enabled, backdropEnabledCount, enableBackdrop, disableBackdrop };
};

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
