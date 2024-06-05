// --- React methods
import React, { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { ContentTooltip } from "./Tooltip";
import { useAddCommonParamsToLink } from "@/hooks/hooks_staking/useNavigateWithCommonParams";
import { AccountCenter } from "./AccountCenter";
import { HeaderProps } from "./Header";

type MinimalHeaderProps = HeaderProps & {
  className?: string;
};

const LINKS = [
  {
    to: "/home",
    text: "Stake",
  },
  {
    to: "/leaderboard",
    text: "Leaderboard",
    comingSoon: true,
  },
  {
    to: "/faq",
    text: "FAQ",
  },
];

const getAssets = () => {
  return {
    passportLogo: "/assets/passportLogoWhite.svg",
    gitcoinLogo: "/assets/gitcoinLogoWhite.svg",
    logoLine: "/assets/logoLine.svg",
    emphasisColor: "white",
  };
};

const MinimalHeader = ({ className, hideMenu, hideAccountCenter }: MinimalHeaderProps): JSX.Element => {
  const assets = useMemo(() => getAssets(), []);
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  const handleLogoClick = async () => {
    if (isConnected) {
      try {
        await disconnectAsync();
        // LoggedInPageRoot will handle the redirect
      } catch (e) {
        console.error("Failed to disconnect", e);
      }
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center cursor-pointer" onClick={handleLogoClick}>
        <img src={assets.gitcoinLogo} alt="Gitcoin Logo" />
        <img className="mx-3 md:mx-6" src={assets.logoLine} alt="Logo Line" />
        <img className="h-8" src={assets.passportLogo} alt="Passport Logo" />
        <div className="ml-3 xl:text-2xl text-color-1 lg:block hidden">Identity Staking</div>
      </div>
      {hideMenu ? (
        <div className={`h-16 ${className} flex-1 flex justify-center items-center`} />
      ) : (
        <div className={`h-16 ${className} flex-1 flex justify-center items-center`}>
          <LinksList className="hidden md:flex" />
          <LinksDropdown className="md:hidden flex" />
        </div>
      )}
      {/* This is really just a placeholder div, because AccountCenter uses fixed positioning */}
      <div className="flex-1">{hideAccountCenter || <AccountCenter />}</div>
    </div>
  );
};

const LinkWithComingSoon = ({
  to,
  children,
  className,
  comingSoon,
}: {
  to: string;
  children: React.ReactNode;
  className: string;
  comingSoon?: boolean;
}) => {
  if (comingSoon) {
    return (
      <button disabled className={`cursor-not-allowed ${className}`}>
        <ContentTooltip tooltipContent="Coming Soon" panelClassName="w-fit">
          {children}
        </ContentTooltip>
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

const LinksList = ({ className }: { className: string }) => {
  const location = useLocation();
  const addCommonParamsToLink = useAddCommonParamsToLink();

  return (
    <div className={`justify-center content-center gap-3 lg:gap-8 ${className}`}>
      {LINKS.map((link) => (
        <LinkWithComingSoon
          key={link.to}
          to={addCommonParamsToLink(link.to)}
          comingSoon={link.comingSoon}
          className={`px-3 ${
            location.pathname.startsWith(link.to)
              ? "text-foreground-2 outline-foreground-2 outline outline-2 rounded-lg"
              : "text-foreground outline-none"
          }`}
        >
          {link.text}
        </LinkWithComingSoon>
      ))}
    </div>
  );
};

const LinksDropdown = ({ className }: { className: string }) => {
  const location = useLocation();
  const addCommonParamsToLink = useAddCommonParamsToLink();

  const currentLinkIndex = useMemo(
    () => LINKS.findIndex((link) => location.pathname.startsWith(link.to)),
    [location.pathname]
  );

  return (
    <div className={`${className}`}>
      <Menu as="div" className="inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full rounded-md px-4 py-2">
            {({ open }) => (
              <div className="flex items-center group">
                {LINKS[currentLinkIndex].text}
                <ChevronDownIcon
                  className={`ml-2 h-7 w-7 transition-transform rounded-2xl p-1 group-hover:bg-foreground-4 ${
                    open ? "transform -rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </div>
            )}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 top-10 left-1/2 -translate-x-[50%] w-36 origin-top rounded-md bg-background border border-foreground-4 shadow-lg focus:outline-none">
            <div className="px-1 py-1">
              {LINKS.map((link, idx) => (
                <Menu.Item key={link.to}>
                  {({ active }) => (
                    <LinkWithComingSoon
                      to={addCommonParamsToLink(link.to)}
                      className={`${
                        active ? "bg-foreground-4 text-color-1" : "text-color-1"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      comingSoon={link.comingSoon}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`text-2xl leading-none ${
                            active ? "text-color-1" : idx === currentLinkIndex ? "text-foreground-4" : "text-color-5"
                          }`}
                        >
                          •
                        </span>
                        {link.text}
                      </div>
                    </LinkWithComingSoon>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default MinimalHeader;
