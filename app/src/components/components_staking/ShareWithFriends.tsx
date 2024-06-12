import React from "react";
import { useAccount, useChainId } from "wagmi";
import { PanelDiv } from "./PanelDiv";

export const ShareWithFriends = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [copied, setCopied] = React.useState(false);

  const shareLink = window.location.origin + `/#/?chain_id=${chainId}&stake_on=${address}`;
  const shareText = `Support me on @gitcoinpassport! Click this link to stake on my digital identity and help boost my trust score: ${shareLink} - It's quick and makes a big difference. Thank you! 🌟`;

  const onCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <PanelDiv>
      <div className="flex items-center justify-center my-5 ml-8 mr-4">
        <div className="flex flex-col grow">
          <span className="text-lg md:text-2xl font-bold text-color-6">Share with Friends</span>
          <span className="text-sm">Get friends to stake on you by sharing this on your socials.</span>
        </div>
        <button className="flex font-bold gap-2 p-4 shrink-0" onClick={onCopy}>
          <div className="grid items-end text-right">
            <span className={`${copied ? "visible" : "invisible"} text-color-6 col-start-1 row-start-1`}>Copied!</span>
            <span className={`${copied ? "invisible" : "visible"} text-color-1 col-start-1 row-start-1`}>Copy</span>
          </div>
          <img src="/assets/copyIcon.svg" alt="Copy Icon" className="h-6 w-auto" />
        </button>
      </div>
    </PanelDiv>
  );
};
