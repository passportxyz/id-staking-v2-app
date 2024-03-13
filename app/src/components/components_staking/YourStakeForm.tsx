import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";

export const YourStakeForm = ({}: any) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriodState] = useState<string>("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddFixedValue = (value: number) => {
    setInputValue(value.toString());
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value.toString());
  };

  const handleStake = () => {
    // TODO:
    console.log("inputValue - ", inputValue);
    console.log("lockedPeriod - ", lockedPeriod);
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelDiv className="grid gap-4 grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <input
          className="col-end-[-1] grow col-start-2 bg-gradient-to-t from-background-4 via-foreground-3 to-background-4"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
        />
        <div className="flex gap-2 col-start-2 col-span-3">
          <Button className="w-16" onClick={() => handleAddFixedValue(5)}>
            5
          </Button>
          <Button className="w-16" onClick={() => handleAddFixedValue(20)}>
            20
          </Button>
          <Button className="w-16" onClick={() => handleAddFixedValue(125)}>
            125
          </Button>
        </div>
        <div className="flex col-span-3 text-sm gap-2 justify-self-end">
          <div className="mx-1 text-right font-bold">
            Lockup
            <br />
            period
          </div>
          <Button className="text-sm" onClick={() => handleLockedPeriod(3)}>
            3 months
          </Button>
          <Button className="text-sm" onClick={() => handleLockedPeriod(6)}>
            6 months
          </Button>
          <Button className="text-sm" onClick={() => handleLockedPeriod(12)}>
            12 months
          </Button>
        </div>
      </PanelDiv>
      <Button className="w-full font-bold" onClick={() => handleStake()}>
        Stake
      </Button>
    </div>
  );
};
