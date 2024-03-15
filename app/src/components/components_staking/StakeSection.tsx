import React, { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";

const svgDropDownIcon = (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.26795 0.999997C6.03775 -0.333336 7.96225 -0.333333 8.73205 1L13.0622 8.5C13.832 9.83334 12.8697 11.5 11.3301 11.5L2.66987 11.5C1.13027 11.5 0.168022 9.83333 0.937822 8.5L5.26795 0.999997Z"
      fill="#C1F6FF"
    />
  </svg>
);

export const StakeSection = ({
  children,
  icon,
  heading,
  subheading,
  stakedAmount,
  last,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  stakedAmount: string;
  icon: {
    src: string;
    alt: string;
  };
  last?: boolean;
}) => {
  const [dropDownOpen, setDropDownState] = useState<boolean>(false);

  const handleDropDown = () => {
    setDropDownState(!dropDownOpen);
  };

  return (
    <div className="col-span-full">
      <Disclosure>
        <Disclosure.Button
          className={`flex items-center p-2 rounded-lg border border-foreground-4 bg-gradient-to-r from-background to-background-5`}
          onClick={handleDropDown}
          as="div"
        >
          <img alt={icon.alt} className="mx-4 h-12" src={icon.src} />
          <div className="grow flex flex-col items-start">
            <div className="text-xl text-color-6 font-bold lg:text-2xl text-left">{heading}</div>
            <div className="text-sm text-left max-w-96 text-pretty">{subheading}</div>
          </div>
          <div className="flex gap-1 flex-col items-center mr-2">
            <div className="text-right">{stakedAmount} GTC</div>
            <div className="text-right">Staked</div>
          </div>
          <div className={`p-4 transition-transform ${dropDownOpen ? "rotate-180" : ""}`}>{svgDropDownIcon}</div>
        </Disclosure.Button>
        <Transition
          enter="transition duration-150 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-100 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Disclosure.Panel className="flex mt-6 flex-col gap-8">
            {children}
            {last || <hr className="border-background-5" />}
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </div>
  );
};
