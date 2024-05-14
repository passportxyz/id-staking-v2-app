import React from "react";
import { Button, ButtonProps } from "./Button";
import { Spinner } from "@chakra-ui/react";

export type LoadingButtonProps = ButtonProps & {
  isLoading?: boolean;
  subtext?: string;
};

export const LoadButton = ({ isLoading, disabled, subtext, children, ...props }: LoadingButtonProps) => {
  return (
    <Button {...props} disabled={disabled || isLoading}>
      <div className="flex flex-col items-center">
        {children}
        <div className={`text-xs ${subtext ? "block" : "hidden"}`}>{subtext}</div>
      </div>
      {isLoading && <Spinner size="sm" />}
    </Button>
  );
};
