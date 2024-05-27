import React, { useEffect, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { formatAmount } from "@/utils/helpers";
import { DropDownIcon } from "./DropDownIcon";

export const StakeSection = ({
  children,
  icon,
  heading,
  subheading,
  last,
  amount,
  initialOpen,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  icon: {
    src: string;
    alt: string;
    height?: string;
  };
  last?: boolean;
  initialOpen?: boolean;
  amount: string;
}) => {
  const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
  const openRef = React.useRef(dropDownOpen);
  openRef.current = dropDownOpen;

  // Unmounting the panel on a delay to allow the animation to complete
  const [panelMounted, setPanelMounted] = useState<boolean>(false);

  useEffect(() => {
    if (initialOpen) {
      handleOpen();
    }
  }, [initialOpen]);

  const handleOpen = () => {
    setPanelMounted(true);
  };

  useEffect(() => {
    // Causes this to open one render after mounting, so animation can play
    setDropDownOpen(panelMounted);
  }, [panelMounted]);

  const handleClose = () => {
    setDropDownOpen(false);
    setTimeout(() => {
      // Only unmount the panel if it's still closed
      // Need to use ref to access runtime state here
      const isOpen = openRef.current;
      if (!isOpen) setPanelMounted(false);
    }, 150);
  };

  const handleClick = () => {
    if (dropDownOpen) handleClose();
    else handleOpen();
  };

  return (
    <div className="col-span-full">
      <Disclosure defaultOpen={initialOpen}>
        <Disclosure.Button
          className={`flex items-center py-6 px-1 md:px-2 rounded-lg border border-foreground-4 bg-gradient-to-r from-background to-background-5
          cursor-pointer transition ease-in-out duration-200 ${
            dropDownOpen ? "opacity-100" : "opacity-70"
          } hover:opacity-100`}
          onClick={handleClick}
          as="div"
        >
          <div className="w-16 flex items-center justify-center mx-2 md:mx-4 shrink-0">
            <img alt={icon.alt} className={icon.height || "h-14"} src={icon.src} />
          </div>
          <div className="grow flex flex-col items-start mr-1">
            <div className="text-xl text-color-6 font-bold lg:text-2xl leading-none lg:leading-none text-left">
              {heading}
            </div>
            <div className="text-sm leading-tight text-left max-w-96 text-pretty hidden mt-1 md:block">
              {subheading}
            </div>
          </div>
          <div className="flex gap-1 text-color-6 flex-col items-end mr-2 shrink-0">
            <div className="text-right font-bold">{formatAmount(amount)} GTC</div>
            <div className="text-right">Staked</div>
          </div>
          <DropDownIcon isOpen={dropDownOpen} className="px-4" />
        </Disclosure.Button>
        {panelMounted && (
          <Disclosure.Panel
            className={`flex flex-col gap-8 transition-all transit duration-150 ease-in-out ${
              dropDownOpen ? "opacity-100 h-full mt-6" : "opacity-0 h-0 overflow-hidden mt-0"
            }
          `}
            static
          >
            {children}
            {last || <hr className="border-background-5" />}
          </Disclosure.Panel>
        )}
      </Disclosure>
    </div>
  );
};
