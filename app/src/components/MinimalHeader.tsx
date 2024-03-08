// --- React methods
import React, { useMemo } from "react";

type MinimalHeaderProps = {
  className?: string;
};

const getAssets = () => {
  return {
    passportLogo: "/assets/passportLogoWhite.svg",
    gitcoinLogo: "/assets/gitcoinLogoWhite.svg",
    logoLine: "/assets/logoLine.svg",
    emphasisColor: "white",
  };
};

const MinimalHeader = ({ className }: MinimalHeaderProps): JSX.Element => {
  const assets = useMemo(() => getAssets(), []);

  return (
    <>
      <div className="absolute flex items-center pt-3">
        <img className="" src={assets.gitcoinLogo} alt="Gitcoin Logo" />
        <img className="mx-3 md:mx-6" src={assets.logoLine} alt="Logo Line" />
        <img className="h-8" src={assets.passportLogo} alt="Passport Logo" />
        <div className="ml-3 text-2xl text-color-1">Passport</div>
      </div>
      <div
        className={`flex justify-center content-center gap-x-8 h-16 pt-5 ${className}`}
      >
        <a href="#/" className="text-indigo-600 h-8">
          Stake
        </a>
        <a href="#/leaderboard" className="text-gray-700 h-8">
          Leaderboard
        </a>
        <a href="#/faq" className="text-gray-700 h-8">
          FAQ
        </a>
      </div>
    </>
  );
};

export default MinimalHeader;
