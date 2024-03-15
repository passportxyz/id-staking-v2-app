import React, { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { formatAmount } from "@/utils/helpers";
import { useAccount } from "wagmi";
import { DropDownIcon } from "./DropDownIcon";

export const StakeSection = ({
  children,
  icon,
  heading,
  subheading,
  last,
  amount,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  icon: {
    src: string;
    alt: string;
  };
  last?: boolean;
  amount: string;
}) => {
  const [dropDownOpen, setDropDownState] = useState<boolean>(false);

  const handleDropDown = () => {
    setDropDownState(!dropDownOpen);
  };
  const { address } = useAccount();
  const { data } = useStakeHistoryQuery(address);
  // TODO different filter for each section i.e.
  // self = staker & stakee == address
  // stake on others = staker == address, stakee != address
  // stake from others = staker != address, stakee == address
  // Should probably pass in a filter function as a prop
  const yourStakeHistory = data?.filter((stake: StakeData) => {
    return stake.stakee === address?.toLowerCase();
  });
  const stakedAmount: string = yourStakeHistory
    ? yourStakeHistory.reduce((acc, stake) => acc + BigInt(stake.amount), 0n).toString()
    : "0";

  return (
    <div className="col-span-full">
      <Disclosure>
        <Disclosure.Button
          className={`flex items-center p-2 rounded-lg border border-foreground-4 bg-gradient-to-r from-background to-background-5`}
          onClick={handleDropDown}
          as="div"
        >
          <img alt={icon.alt} className="mx-4 h-12" src={icon.src} />
          <div className="grow flex flex-col items-start mr-1">
            <div className="text-xl text-color-6 font-bold lg:text-2xl text-left">{heading}</div>
            <div className="text-sm text-left max-w-96 text-pretty">{subheading}</div>
          </div>
          <div className="flex gap-1 flex-col items-center mr-2">
            <div className="text-right">{formatAmount(amount)} GTC</div>
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
          <Disclosure.Panel className="flex mt-6 flex-col gap-8">
            {children}
            {last || <hr className="border-background-5" />}
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </div>
  );
};
