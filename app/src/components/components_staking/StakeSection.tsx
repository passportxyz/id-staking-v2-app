import React, { useEffect, useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
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

  useEffect(() => {
    if (initialOpen) {
      setDropDownOpen(true);
    }
  }, [initialOpen]);

  const handleDropDown = () => {
    setDropDownOpen(!dropDownOpen);
  };

  return (
    <div className="col-span-full">
      <Disclosure defaultOpen={initialOpen}>
        <Disclosure.Button
          className={`flex items-center py-6 px-1 md:px-2 rounded-lg border border-foreground-4 bg-gradient-to-r from-background to-background-5`}
          onClick={handleDropDown}
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
        <Transition
          enter="transition duration-150 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-100 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          {dropDownOpen && (
            <Disclosure.Panel className="flex mt-6 flex-col gap-8" static>
              {children}
              {last || <hr className="border-background-5" />}
            </Disclosure.Panel>
          )}
        </Transition>
      </Disclosure>
    </div>
  );
};
