import React from "react";
import { YourStakeForm } from "./YourStakeForm";
import { StakeSection } from "./StakeSection";
import { YourStakeHistory } from "./YourStakeHistory";

export const YourStake = ({}: any) => {
  return (
    <StakeSection
      icon={{
        src: "/assets/personIcon.svg",
        alt: "Person Icon",
      }}
      heading="Your Stake"
      subheading="Secure your identity by staking GTC. Higher stakes mean more trust in your passport."
      stakedAmount="0"
    >
      <YourStakeForm />
      <YourStakeHistory />
    </StakeSection>
  );
};
