// --- React methods
import React, { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

type MinimalHeaderProps = {
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

const MinimalHeader = ({ className }: MinimalHeaderProps): JSX.Element => {
  const assets = useMemo(() => getAssets(), []);

  return (
    <>
      <div className="absolute flex items-center pt-3">
        <img className="" src={assets.gitcoinLogo} alt="Gitcoin Logo" />
        <img className="mx-3 md:mx-6" src={assets.logoLine} alt="Logo Line" />
        <img className="h-8" src={assets.passportLogo} alt="Passport Logo" />
        <div className="ml-3 text-2xl text-color-1 lg:block hidden">Identity Staking</div>
      </div>
      <div className={`h-16 ${className} flex justify-center items-center`}>
        <LinksList className="hidden md:flex" />
        <LinksDropdown className="md:hidden flex" />
      </div>
    </>
  );
};

const LinksList = ({ className }: { className: string }) => {
  const location = useLocation();

  return (
    <div className={`justify-center content-center gap-3 lg:gap-8 ${className}`}>
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={` px-3 ${
            location.pathname.startsWith(link.to)
              ? "text-foreground-2 outline-foreground-2 outline outline-2 rounded-lg"
              : "text-foreground outline-none"
          }`}
        >
          {link.text}
        </Link>
      ))}
    </div>
  );
};

const LinksDropdown = ({ className }: { className: string }) => {
  const location = useLocation();

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
          <Menu.Items className="absolute top-10 left-1/2 -translate-x-[50%] w-36 origin-top rounded-md bg-background border border-foreground-4 shadow-lg focus:outline-none">
            <div className="px-1 py-1">
              {LINKS.map((link, idx) => (
                <Menu.Item key={link.to}>
                  {({ active }) => (
                    <Link
                      to={link.to}
                      className={`${
                        active ? "bg-foreground-4 text-color-1" : "text-color-1"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
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
                    </Link>
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
