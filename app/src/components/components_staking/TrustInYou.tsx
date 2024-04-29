import React from "react";
import { TrustInYouHistory } from "./TrustInYouHistory";
import { StakeSection } from "./StakeSection";
import { useStakeOnYouHistoryQuery } from "@/utils/stakeHistory";
import { useAccount } from "wagmi";
import { ShareWithFriends } from "./ShareWithFriends";

export const TrustInYou = ({}: any) => {
  const { address } = useAccount();
  const { data } = useStakeOnYouHistoryQuery(address);

  const stakedAmount: string = data?.reduce((acc, stake) => acc + BigInt(stake.amount), 0n).toString() || "0";

  return (
    <StakeSection
      icon={{
        src: "/assets/shield-person-icon.svg",
        alt: "Shield Icon",
        height: "h-16",
      }}
      heading="Trust in You"
      subheading="View GTC staked on you. This shows community trust and adds value to your passport."
      amount={stakedAmount}
      last={true}
    >
      <ShareWithFriends />
      <TrustInYouHistory />
    </StakeSection>
  );
};
