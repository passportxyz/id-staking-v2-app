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
      <a href="#">TODO Learn more about slashing</a>
    </>,
    <>
      Specifics about slashing and wallets. <a href="#">TODO Learn more</a>
    </>,
    <>
      I agree to the <a href="#/terms">Terms and Conditions.</a>
    </>,
  ];

  const [acceptedTerms, setAcceptedTerms] = useState(terms.map(() => false));
  const termsCheckBoxes = terms.map((t, index) => (
    <li key={index}>
      <label>
        <input
          id="id-tos-1"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          checked={acceptedTerms[index]}
          onChange={(e) => {
            console.log(e.target.value);
            const newacceptedTerms = [...acceptedTerms];
            newacceptedTerms[index] = !newacceptedTerms[index];
            setAcceptedTerms(newacceptedTerms);
            return;
          }}
        />
        {t}
      </label>
    </li>
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
        <ul>{termsCheckBoxes}</ul>
      </div>
    </StakeModal>
  );
};
