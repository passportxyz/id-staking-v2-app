import React from "react";

const ID_STAKING_ICON = () => (
  <svg width="56" height="64" viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M27.05 63.7456L0.949958 48.6947C0.362171 48.3555 0 47.7293 0 47.0509V16.9491C0 16.2707 0.362171 15.6445 0.949958 15.3053L27.05 0.254406C27.6378 -0.084802 28.3622 -0.084802 28.95 0.254406L55.05 15.3053C55.6378 15.6445 56 16.2707 56 16.9491V47.0509C56 47.7293 55.6378 48.3555 55.05 48.6947L28.95 63.7456C28.3622 64.0848 27.6378 64.0848 27.05 63.7456ZM5.69975 45.9561L27.05 58.2685C27.6378 58.6077 28.3622 58.6077 28.95 58.2685L50.3003 45.9561C50.888 45.6169 51.2502 44.9907 51.2502 44.3123V19.6889C51.2502 19.0105 50.888 18.3842 50.3003 18.045L28.95 5.73274C28.3622 5.39353 27.6378 5.39353 27.05 5.73274L5.69975 18.045C5.11196 18.3842 4.74979 19.0105 4.74979 19.6889V44.3123C4.74979 44.9907 5.11196 45.6169 5.69975 45.9561Z"
      fill="url(#paint0_linear_8570_3010)"
    />
    <path
      d="M27.0494 10.088L9.47521 20.2227C8.88743 20.5619 8.52526 21.1881 8.52526 21.8665V41.0401C8.52526 42.3957 9.2496 43.6494 10.4252 44.3266L12.5626 45.5589C12.8796 45.7416 13.275 45.5139 13.275 45.1486V24.6063C13.275 23.9279 13.6372 23.3017 14.225 22.9624L27.0494 15.5675C27.6372 15.2283 28.3616 15.2283 28.9493 15.5675L41.7738 22.9624C42.3616 23.3017 42.7237 23.9279 42.7237 24.6063V39.3974C42.7237 40.0759 42.3616 40.7021 41.7738 41.0413L28.9493 48.4363C28.3616 48.7755 27.6372 48.7755 27.0494 48.4363L22.7746 45.9717C22.1868 45.6325 21.8247 45.0062 21.8247 44.3278V29.5367C21.8247 28.8583 22.1868 28.232 22.7746 27.8928L27.0494 25.4282C27.6372 25.089 28.3616 25.089 28.9493 25.4282L33.2242 27.8928C33.8119 28.232 34.1741 28.8583 34.1741 29.5367V34.4671C34.1741 35.1455 33.8119 35.7717 33.2242 36.1109L31.0868 37.3432C30.7697 37.5259 30.3743 37.2981 30.3743 36.9328V31.7617C30.3743 31.0833 30.0121 30.4571 29.4243 30.1178L28.4744 29.5699C28.1799 29.4003 27.8189 29.4003 27.5244 29.5699L26.337 30.2542C25.8964 30.5081 25.6245 30.9789 25.6245 31.4865V42.1562C25.6245 42.837 25.9902 43.4656 26.5816 43.8036L27.0399 44.0645C27.6265 44.399 28.3473 44.3978 28.9327 44.0598L37.9739 38.8459C38.5617 38.5067 38.9239 37.8805 38.9239 37.2021V26.7934C38.9239 26.115 38.5617 25.4887 37.9739 25.1495L28.9493 19.9452C28.3616 19.606 27.6372 19.606 27.0494 19.9452L18.0248 25.1495C17.437 25.4887 17.0749 26.115 17.0749 26.7934V47.0616C17.0749 47.7401 17.437 48.3663 18.0248 48.7055L27.0494 53.9099C27.6372 54.2491 28.3616 54.2491 28.9493 53.9099L46.5236 43.7751C47.1114 43.4359 47.4735 42.8097 47.4735 42.1313V21.863C47.4735 21.1846 47.1114 20.5583 46.5236 20.2191L28.9493 10.0844C28.3616 9.7452 27.6372 9.7452 27.0494 10.0844V10.088Z"
      fill="url(#paint1_linear_8570_3010)"
    />
    <defs>
      <linearGradient id="paint0_linear_8570_3010" x1="28" y1="0" x2="28" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0.359375" />
        <stop offset="1" stopColor="#6CB6AD" />
      </linearGradient>
      <linearGradient id="paint1_linear_8570_3010" x1="28" y1="0" x2="28" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0.359375" />
        <stop offset="1" stopColor="#6CB6AD" />
      </linearGradient>
    </defs>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-foreground-2 to-foreground-4 bottom-0 fixed w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-4">
            <ID_STAKING_ICON />
          </div>
          <span className="ml-3 text-lg text-color-4">Identity Staking</span>
        </div>
        <div className="flex space-x-8 items-center">
          <div className="flex flex-col items-start border-r-2 border-foreground-3 ">
            <h4 className="font-semibold text-color-8 mr-4">Links</h4>
            <a href="https://passport.gitcoin.co/" className="text-color-8 hover:underline mr-4">
              Passport
            </a>
          </div>
          <div className="flex flex-col items-start border-r-2 border-foreground-3 ">
            <h4 className="font-semibold text-color-8 mr-4">Info</h4>
            <div className="flex-row space-x-4 mr-4">
              <a href="#/faq" className="text-color-8 hover:underline">
                FAQ
              </a>
              <a href="#/leaderboard" className="text-color-8 hover:underline">
                Leaderboard
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <h4 className="font-semibold text-color-8">Legal</h4>
            <div className="flex-row justify-between space-x-4">
              <a href="#/terms" className="text-color-8 hover:underline">
                Terms & Conditions
              </a>
              <a href="https://www.gitcoin.co/privacy" className="text-color-8 hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// export default Footer;
