import React, { ButtonHTMLAttributes, useMemo } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "custom";
};

// Children are centered and spaced out with gap-4.
// If your button just contains text, simply use the text
// e.g. <Button>Click me</Button>
// If your button has an icon or other elements, just include both elements
// e.g. <Button><Icon /><span>Click me</span></Button>
export const Button = ({ variant, className, ...props }: ButtonProps) => {
  const variantClassName = useMemo(() => {
    if (variant === "custom") {
      return "";
    } else if (variant === "secondary") {
      return "text-color-1 bg-background border border-foreground-3 hover:border-foreground-4";
    } else {
      // primary, default
      return "text-color-4 bg-background-8 hover:bg-background-9";
    }
  }, [variant]);

  return (
    <button
      className={`group flex items-center justify-center gap-4 rounded-md px-5 py-2 font-alt text-base text-color-1
        disabled:cursor-not-allowed disabled:bg-foreground-3 disabled:brightness-75
        transition-colors duration-200 ease-in-out
        ${variantClassName} focus:border-transparent focus:outline-none ${className}`}
      {...props}
    />
  );
};

export type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "active" | "inactive";
};

export const FormButton = ({ variant, className, ...props }: FormButtonProps) => {
  const variantClassName = useMemo(() => {
    if (variant === "active") {
      return "text-color-4 bg-foreground-2";
    } else {
      return "text-color-4 bg-foreground-4 hover:bg-foreground-2";
    }
  }, [variant]);

  return (
    <button
      className={`group flex items-center justify-center gap-4 py-2 text-base text-color-1
        disabled:cursor-not-allowed disabled:bg-foreground-3 disabled:brightness-75 
        !px-1 rounded-lg leading-none whitespace-nowrap
        ${variantClassName} transition-all ease-in-out duration-200 focus:border-transparent focus:outline-none ${className}`}
      {...props}
    />
  );
};
