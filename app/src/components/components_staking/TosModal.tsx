import React, { useState } from "react";
import { StakeModal } from "./StakeModal";

export const TosModal = ({
  isPending,
  isOpen,
  onClose,
  onButtonClick,
  buttonDisabled,
}: {
  isPending: boolean;
  isOpen: boolean;
  onClose: () => void;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
}) => {
  const terms = [
    <>
      I understand that I may be slashed for what is deemed Sybil behavior when using Passport. Slashing criteria will
      continue to evolve over time.{" "}
      <a
        href="https://support.passport.xyz/passport-knowledge-base/gtc-staking/passport-slashing"
        className="underline font-bold text-[#4ABEFF]"
      >
        Learn more about slashing conditions.
      </a>
    </>,
    <>
      I understand that credentials/Stamps may be verified on multiple Passports (i.e., the same Google account can be
      verified on two wallets), BUT those wallets should never be submitted to the same application.{" "}
      <a
        href="https://docs.passport.xyz/building-with-passport/major-concepts/deduplicating-stamps"
        className="underline font-bold text-[#4ABEFF]"
      >
        Learn more about Passport Stamps and wallets.
      </a>
    </>,
    <>
      I have read, understand, and agree to the{" "}
      <a href="https://stake.passport.xyz/#/terms" className="underline font-bold text-[#4ABEFF]">
        Terms and Conditions of Passport&apos;s Identity Staking.
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
      title={"Acknowledge and Agree to Continue"}
      buttonText={"Proceed"}
      onButtonClick={onButtonClick}
      buttonSubtext={isPending ? "(Sign message in wallet)" : ""}
      buttonLoading={isPending}
      isOpen={isOpen}
      onClose={onClose}
      buttonDisabled={buttonDisabled || !allTermsAccepted}
    >
      <div>
        Before Staking Your Identity, Please Agree to the Following:
        <div className="flex flex-col pt-12 pb-4 w-full">{termsCheckBoxes}</div>
        <b>Please note:</b> All three boxes must be checked to enable the &quot;Proceed&quot; button and continue to the
        app.
      </div>
    </StakeModal>
  );
};
