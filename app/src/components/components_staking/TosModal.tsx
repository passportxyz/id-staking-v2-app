import React, { useCallback, useEffect, useState } from "react";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, formatDate } from "@/utils/helpers";
import { StakeData } from "@/utils/stakeHistory";
import { parseEther } from "viem";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";
import { all } from "axios";

export const TosModal = ({
  isOpen,
  onClose,
  onButtonClick,
  buttonDisabled,
}: {
  isOpen: boolean;
  onClose: () => void;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
}) => {
  const terms = [
    <>
      I aknowledge that I might be slashed for bad behaviour.
      <a href="#/terms" className="text-color-6">
        Learn more about slashing
      </a>
    </>,
    <>
      Specifics about slashing and wallets.{" "}
      <a
        href="https://docs.passport.gitcoin.co/building-with-passport/major-concepts/deduplicating-stamps"
        target="blank"
        className="text-color-6"
      >
        Learn more
      </a>
    </>,
    <>
      I agree to the{" "}
      <a href="#/terms" className="text-color-6">
        Terms and Conditions.
      </a>
    </>,
  ];

  const [acceptedTerms, setAcceptedTerms] = useState(terms.map(() => false));
  const termsCheckBoxes = terms.map((t, index) => (
    <label key={index}>
      <div className="flex justify-start gap-2 pb-4">
        <div className="flex-1 min-w-6 max-w-6 pt-1">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={acceptedTerms[index]}
            onChange={(e) => {
              console.log(e.target.value);
              const newacceptedTerms = [...acceptedTerms];
              newacceptedTerms[index] = !newacceptedTerms[index];
              setAcceptedTerms(newacceptedTerms);
            }}
          />
        </div>
        <div className="flex-grow">{t}</div>
      </div>
    </label>
  ));
  const allTermsAccepted = acceptedTerms.every((t) => t);
  return (
    <StakeModal
      title={"Attention ???"}
      buttonText={"Proceed"}
      onButtonClick={onButtonClick}
      buttonLoading={false}
      isOpen={isOpen}
      onClose={onClose}
      buttonDisabled={buttonDisabled || !allTermsAccepted}
    >
      <div>
        Before you can stake, you have to agree to the following:
        <div className="flex flex-col pt-12 pb-12 w-full">{termsCheckBoxes}</div>
      </div>
    </StakeModal>
  );
};
