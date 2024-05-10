// --- React components/methods
import React, { useEffect } from "react";

const shouldMinimize = () => {
  return window.innerWidth < 1120 || window.pageYOffset > 120 || (window.pageYOffset > 50 && window.innerWidth < 1024);
};

const ManageAccountCenter = ({ children }: { children: React.ReactNode }) => {
  // TODO
  const updateAccountCenter = (props: any) => {};
  const position = "topRight";

  useEffect(() => {
    const onEvent = () => {
      if (shouldMinimize()) {
        updateAccountCenter({ minimal: true, position, enabled: true });
      } else {
        updateAccountCenter({ minimal: false, position, enabled: true });
      }
    };

    // run on mount to set initial state
    onEvent();

    // remove existing event listeners
    window.removeEventListener("resize", onEvent);
    window.removeEventListener("scroll", onEvent);

    // add listeners
    // passive stops the browser from waiting to see if the event
    // listener will call preventDefault() -- better for performance
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent, { passive: true });

    // clean up on dismount
    return () => {
      window.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
    };
  }, [updateAccountCenter]);

  return <>{children}</>;
};

export default ManageAccountCenter;
