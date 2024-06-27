import React from "react";
import { useMediaQuery } from "react-responsive";

interface IDStakingIconProps {
  className?: string;
  style?: React.CSSProperties;
}

const ID_STAKING_ICON: React.FC<IDStakingIconProps> = ({ className, style }) => (
  <svg
    width="36"
    height="40"
    viewBox="0 0 36 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M17.3088 39.841L0.60786 30.4342C0.231747 30.2222 0 29.8308 0 29.4068V10.5932C0 10.1692 0.231747 9.7778 0.60786 9.5658L17.3088 0.159004C17.6849 -0.0530012 18.1484 -0.0530012 18.5245 0.159004L35.2255 9.5658C35.6016 9.7778 35.8333 10.1692 35.8333 10.5932V29.4068C35.8333 29.8308 35.6016 30.2222 35.2255 30.4342L18.5245 39.841C18.1484 40.053 17.6849 40.053 17.3088 39.841ZM3.64716 28.7226L17.3088 36.4178C17.6849 36.6298 18.1484 36.6298 18.5245 36.4178L32.1862 28.7226C32.5623 28.5106 32.794 28.1192 32.794 27.6952V12.3056C32.794 11.8815 32.5623 11.4901 32.1862 11.2781L18.5245 3.58296C18.1484 3.37096 17.6849 3.37096 17.3088 3.58296L3.64716 11.2781C3.27105 11.4901 3.0393 11.8815 3.0393 12.3056V27.6952C3.0393 28.1192 3.27105 28.5106 3.64716 28.7226Z"
      fill="#4B5F65"
    />
    <path
      d="M17.3084 6.30498L6.06301 12.6392C5.6869 12.8512 5.45515 13.2426 5.45515 13.6666V25.6501C5.45515 26.4973 5.91864 27.2809 6.67087 27.7041L8.03855 28.4743C8.24143 28.5885 8.49445 28.4462 8.49445 28.2178V15.3789C8.49445 14.9549 8.7262 14.5635 9.10231 14.3515L17.3084 9.72967C17.6845 9.51767 18.148 9.51767 18.5241 9.72967L26.7302 14.3515C27.1064 14.5635 27.3381 14.9549 27.3381 15.3789V24.6234C27.3381 25.0474 27.1064 25.4388 26.7302 25.6508L18.5241 30.2727C18.148 30.4847 17.6845 30.4847 17.3084 30.2727L14.573 28.7323C14.1969 28.5203 13.9652 28.1289 13.9652 27.7049V18.4604C13.9652 18.0364 14.1969 17.645 14.573 17.433L17.3084 15.8926C17.6845 15.6806 18.148 15.6806 18.5241 15.8926L21.2595 17.433C21.6356 17.645 21.8674 18.0364 21.8674 18.4604V21.5419C21.8674 21.9659 21.6356 22.3573 21.2595 22.5693L19.8918 23.3395C19.6889 23.4537 19.4359 23.3113 19.4359 23.083V19.8511C19.4359 19.4271 19.2042 19.0357 18.8281 18.8237L18.2202 18.4812C18.0318 18.3752 17.8008 18.3752 17.6123 18.4812L16.8525 18.9089C16.5706 19.0675 16.3966 19.3618 16.3966 19.6791V26.3476C16.3966 26.7731 16.6307 27.166 17.009 27.3772L17.3023 27.5403C17.6777 27.7494 18.1389 27.7486 18.5135 27.5374L24.2988 24.2787C24.6749 24.0667 24.9067 23.6753 24.9067 23.2513V16.7459C24.9067 16.3218 24.6749 15.9305 24.2988 15.7184L18.5241 12.4657C18.148 12.2537 17.6845 12.2537 17.3084 12.4657L11.5337 15.7184C11.1576 15.9305 10.9259 16.3218 10.9259 16.7459V29.4135C10.9259 29.8375 11.1576 30.2289 11.5337 30.4409L17.3084 33.6937C17.6845 33.9057 18.148 33.9057 18.5241 33.6937L29.7695 27.3594C30.1457 27.1474 30.3774 26.756 30.3774 26.332V13.6644C30.3774 13.2404 30.1457 12.849 29.7695 12.637L18.5241 6.30276C18.148 6.09075 17.6845 6.09075 17.3084 6.30276V6.30498Z"
      fill="#4B5F65"
    />
  </svg>
);

const BigScreenFooter: React.FC = () => {
  return (
    <footer className="z-10 hidden md:flex justify-between bg-gradient-to-r from-foreground-2 to-foreground-4 bottom-0 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-4">
            <ID_STAKING_ICON />
          </div>
          <span className="ml-3 text-lg text-color-4">Identity Staking</span>
        </div>
        <div className="flex space-x-8 items-center ">
          <div className="flex flex-col items-start border-r-2 border-foreground-3  min-w-[70px]">
            <h4 className="font-semibold text-color-8 mr-4">Links</h4>
            <a href="https://passport.gitcoin.co/" className="text-color-8 hover:underline mr-4">
              Passport
            </a>
          </div>
          <div className="flex flex-col items-start border-r-2 min-w-[70px] border-foreground-3 ">
            <h4 className="font-semibold text-color-8 mr-4">Info</h4>
            <div className="flex-row space-x-4 mr-4">
              <a href="#/faq" className="text-color-8 hover:underline">
                FAQ
              </a>
              {/* <a href="#/leaderboard" className="text-color-8 hover:underline">
                Leaderboard
              </a> */}
            </div>
          </div>
          <div className="flex flex-col items-start min-w-[70px]">
            <h4 className="font-semibold text-color-8">Legal</h4>
            <div className="flex-row justify-between space-x-4">
              <a href="#/terms" className="text-color-8 hover:underline">
                Terms & Conditions
              </a>
              <a href="https://www.gitcoin.co/privacy" className="text-color-8 hover:underline pr-4">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PhoneScreenFooter: React.FC = () => (
  <footer className="md:hidden bg-gradient-to-r from-foreground-2 to-foreground-4 items-center w-full flex  overflow-hidden">
    <div className="flex flex-grow flex-col md:flex-row p-4 ">
      <div className="flex items-start mb-2 md:mb-0">
        <ID_STAKING_ICON />
        <span className="m-2 md:text-lg text-color-4">Identity Staking</span>
      </div>
      <div className="overflow-x-hidden text-sm">
        <div className="relative pl-4 flex flex-row flex-wrap items-start justify-items-start -ml-8">
          <div className="border-l-2 border-foreground-3 px-4">
            <a href="https://passport.gitcoin.co/" className="text-color-8 hover:underline ">
              Passport
            </a>
          </div>
          <div className="border-l-2 border-foreground-3 px-4">
            <a href="#/faq" className="text-color-8 hover:underline">
              FAQ
            </a>
          </div>
          <div className="border-l-2 border-foreground-3 px-4">
            <a href="#/terms" className="text-color-8 hover:underline">
              Terms & Conditions
            </a>
          </div>
          <div className="border-l-2 border-foreground-3 px-4">
            <a href="https://www.gitcoin.co/privacy" className="text-color-8 hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="-mr-[50px]">
      <ID_STAKING_ICON className="my-2 h-auto w-[100px] opacity-25" />
    </div>
  </footer>
);

const Footer = () => {
  return (
    <>
      <PhoneScreenFooter />
      <BigScreenFooter />
    </>
  );
};

export default Footer;
