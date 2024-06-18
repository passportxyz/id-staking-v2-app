import React, { useMemo } from "react";
import { YourStakeForm } from "./YourStakeForm";
import { StakeSection } from "./StakeSection";
import { useSelfStakes } from "./YourStakeHistory";
import { YourStakeHistory } from "./YourStakeHistory";
import { useAccount, useChainId } from "wagmi";

export const YourStake = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data } = useSelfStakes();

  const stakedAmount = useMemo(
    () =>
      data
        ? data.reduce((acc, stake) => {
            if (
              stake.staker.toLowerCase() === address?.toLowerCase() &&
              stake.stakee.toLowerCase() === address.toLowerCase() &&
              stake.chain === chainId
            ) {
              acc += BigInt(stake.amount);
            }
            return acc;
          }, 0n)
        : 0n,
    [data, address, chainId]
  );

  return (
    <StakeSection
      icon={{
        src: "/assets/personIcon.svg",
        alt: "Person Icon",
      }}
      heading="Your Stake"
      subheading="Secure your identity by staking GTC. Higher stakes mean more trust in your passport."
      amount={stakedAmount.toString()}
    >
      <YourStakeForm />
      <YourStakeHistory />
    </StakeSection>
  );
};
