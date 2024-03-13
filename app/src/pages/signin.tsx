/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
// --- React Methods
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// --- Shared data context
import { useWalletStore } from "../context/walletStore";

// --- Components
import PageRoot from "../components/PageRoot";
import SIWEButton from "../components/SIWEButton";
import { useDatastoreConnectionContext } from "../context/datastoreConnectionContext";
import { useToast } from "@chakra-ui/react";
import { DoneToastContent } from "../components/DoneToastContent";
import { WebmVideo } from "../components/WebmVideo";

export default function Home() {
  const address = useWalletStore((state) => state.address);
  const connectWallet = useWalletStore((state) => state.connect);
  const connectError = useWalletStore((state) => state.error);
  const { connect: connectDatastore } = useDatastoreConnectionContext();
  const toast = useToast();
  const [enableEthBranding, setEnableEthBranding] = useState(true);

  const navigate = useNavigate();

  // Route user to dashboard when wallet is connected
  useEffect(() => {
    if (address) {
      navigate("/home");
    }
  }, [address]);

  useEffect(() => {
    if (connectError) {
      console.log("displaying Connection Error", connectError);
      console.log("displaying Connection Error", (connectError as Error).message);
      toast({
        duration: 6000,
        isClosable: true,
        render: (result: any) => (
          <DoneToastContent
            title={"Connection Error"}
            body={(connectError as Error).message}
            icon="../assets/verification-failed-bright.svg"
            result={result}
          />
        ),
      });
    }
  }, [connectError]);

  return (
    <PageRoot className="text-color-2" backgroundGradientStyle="top-only">
      <div className="flex h-full min-h-default items-center justify-center self-center p-8">
        <div className="absolute top-0 right-0 z-0 h-auto w-full  gradient-mask-t-0 md:h-full md:w-auto md:gradient-mask-l-0">
          <svg width="674" height="746" viewBox="0 0 674 746" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M325.567 742.951L11.4334 562.576C4.35899 558.511 0 551.006 0 542.875V182.125C0 173.994 4.35899 166.489 11.4334 162.424L325.567 -17.9511C332.641 -22.0163 341.359 -22.0163 348.433 -17.9511L662.567 162.424C669.641 166.489 674 173.994 674 182.125V542.875C674 551.006 669.641 558.511 662.567 562.576L348.433 742.951C341.359 747.016 332.641 747.016 325.567 742.951ZM68.6005 529.756L325.567 677.311C332.641 681.376 341.359 681.376 348.433 677.311L605.4 529.756C612.474 525.69 616.833 518.185 616.833 510.055V214.959C616.833 206.829 612.474 199.324 605.4 195.258L348.433 47.7033C341.359 43.6381 332.641 43.6381 325.567 47.7033L68.6005 195.258C61.5261 199.324 57.1671 206.829 57.1671 214.959V510.055C57.1671 518.185 61.5261 525.69 68.6005 529.756Z"
              fill="url(#paint0_linear_7366_2487)"
            />
            <path
              d="M325.559 99.898L114.041 221.356C106.967 225.422 102.608 232.926 102.608 241.057V470.84C102.608 487.087 111.326 502.111 125.474 510.227L151.2 524.995C155.015 527.184 159.775 524.455 159.775 520.077V273.891C159.775 265.761 164.134 258.256 171.208 254.191L325.559 165.566C332.634 161.501 341.352 161.501 348.426 165.566L502.777 254.191C509.852 258.256 514.211 265.761 514.211 273.891V451.154C514.211 459.284 509.852 466.789 502.777 470.854L348.426 559.478C341.352 563.543 332.634 563.543 325.559 559.478L274.109 529.942C267.034 525.876 262.675 518.371 262.675 510.241V332.979C262.675 324.848 267.034 317.343 274.109 313.278L325.559 283.741C332.634 279.676 341.352 279.676 348.426 283.741L399.876 313.278C406.951 317.343 411.31 324.848 411.31 332.979V392.066C411.31 400.196 406.951 407.702 399.876 411.767L374.151 426.535C370.335 428.724 365.576 425.995 365.576 421.617V359.644C365.576 351.514 361.217 344.009 354.143 339.944L342.709 333.377C339.165 331.344 334.82 331.344 331.276 333.377L316.984 341.578C311.682 344.62 308.409 350.263 308.409 356.346V484.215C308.409 492.374 312.811 499.908 319.928 503.959L325.445 507.086C332.505 511.094 341.18 511.08 348.226 507.029L457.044 444.544C464.118 440.479 468.477 432.974 468.477 424.844V300.102C468.477 291.971 464.118 284.466 457.044 280.401L348.426 218.03C341.352 213.965 332.634 213.965 325.559 218.03L216.942 280.401C209.867 284.466 205.508 291.971 205.508 300.102V543.004C205.508 551.135 209.867 558.64 216.942 562.705L325.559 625.076C332.634 629.141 341.352 629.141 348.426 625.076L559.944 503.617C567.019 499.552 571.378 492.047 571.378 483.917V241.014C571.378 232.884 567.019 225.379 559.944 221.314L348.426 99.8553C341.352 95.7901 332.634 95.7901 325.559 99.8553V99.898Z"
              fill="url(#paint1_linear_7366_2487)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_7366_2487"
                x1="851.141"
                y1="-54.2942"
                x2="86.5063"
                y2="621.029"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#22645C" />
                <stop offset="1" stopColor="#122B33" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_7366_2487"
                x1="851.141"
                y1="-54.2942"
                x2="86.5063"
                y2="621.029"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#22645C" />
                <stop offset="1" stop-color="#122B33" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="grid grid-cols-1">
          <div className="z-10 grid grid-flow-row grid-cols-2 gap-4 lg:grid-flow-col">
            <div>
              <div className="col-span-2 font-heading text-6xl lg:row-start-2">
                BOOST YOUR
                <br />
                PASSPORT SCORE
              </div>
              <div className="col-span-2 mb-4 text-2xl leading-none text-foreground-2 md:text-5xl"></div>
              <div className="col-span-2 max-w-md text-lg lg:max-w-sm">
                Solidify your Passport identity with the GTC Staking Stamp. By staking GTC, you not only contribute to
                the ecosystem&amp;s security but also enhance your Passport Score, gaining recognition and trust within
                the community.
              </div>
              <SIWEButton
                enableEthBranding={enableEthBranding}
                data-testid="connectWalletButton"
                onClick={() => connectWallet(connectDatastore)}
                className="col-span-2 mt-4 lg:w-3/4"
              />
            </div>
            <div>Right panel - TO BE DONE</div>
          </div>
          <div className="z-10 flex gap-8 justify-between pt-32">
            <div className={`flex items-center justify-between h-14 rounded-lg border w-1/3`}>
              <span className="px-8 text-xl">GTC Staked</span>
              <div className="flex items-center rounded-lg border text-2xl h-full px-4 w-1/3">
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.9224 7.49436C17.8686 7.40416 17.8125 7.31364 17.7555 7.22502C17.5963 6.97775 17.4232 6.73522 17.2417 6.50435C16.3782 5.40648 15.2557 4.49279 13.9954 3.86201C12.6755 3.20158 11.2493 2.85529 9.75633 2.83321C9.65877 2.83163 9.57935 2.75373 9.57935 2.65943V1.33984C9.57935 0.870219 9.18682 0.488281 8.70418 0.488281C8.22153 0.488281 7.829 0.870219 7.829 1.33984V2.84961C7.829 2.93193 7.76838 3.00352 7.68508 3.01992C7.18299 3.11927 6.68608 3.25867 6.20765 3.43497C6.18723 3.44254 6.16584 3.44633 6.14412 3.44633C6.04591 3.44633 5.96584 3.36843 5.96584 3.27255V1.33984C5.96584 0.870219 5.57331 0.488281 5.09067 0.488281C4.60802 0.488281 4.21549 0.870219 4.21549 1.33984V4.27486C4.21549 4.37894 4.16265 4.47734 4.07416 4.53789C2.846 5.38125 1.82463 6.50814 1.11995 7.7965C0.392261 9.12714 0.00523818 10.6319 5.19441e-05 12.1486C-0.00416187 13.3997 0.248019 14.6175 0.749463 15.768C1.23276 16.8769 1.92577 17.8764 2.80937 18.739C3.70335 19.6117 4.74448 20.2979 5.90393 20.7786C7.1039 21.276 8.37388 21.5283 9.67854 21.5283H16.8342C17.1506 21.5283 17.4083 21.2779 17.4083 20.9697V16.3108C17.4083 16.066 17.2809 15.8424 17.0676 15.7128L16.6673 15.4693L16.6459 15.4564L15.1497 14.5462L15.1218 14.5291L13.2305 13.3789C13.1092 13.3051 13.0509 13.1651 13.0856 13.0301C13.1566 12.7538 13.1925 12.4678 13.1925 12.1798C13.1925 11.8918 13.1566 11.6058 13.0856 11.3295C13.0509 11.1948 13.1092 11.0545 13.2305 10.9807L15.1218 9.83046L15.1497 9.81343L16.6459 8.90321L16.6673 8.89028L17.7285 8.24499C17.9927 8.08414 18.078 7.75487 17.9224 7.49436ZM15.5964 7.40101C15.5821 7.49436 15.527 7.57636 15.445 7.62619L12.483 9.42802C12.3828 9.48889 12.2674 9.52106 12.1495 9.52106C12.0127 9.52106 11.8775 9.4769 11.7683 9.39648C11.1424 8.93569 10.3952 8.69221 9.60788 8.69221H9.58843C8.64907 8.69726 7.76093 9.05712 7.08802 9.70556C6.4151 10.3543 6.03683 11.2147 6.02322 12.1287C6.00928 13.0708 6.37556 13.9586 7.05431 14.6291C7.73338 15.2996 8.64032 15.669 9.60788 15.669C10.3968 15.669 11.1453 15.4245 11.7718 14.9619C11.8804 14.8817 12.0104 14.8392 12.1478 14.8392C12.2665 14.8392 12.3825 14.8717 12.483 14.9328L15.468 16.7485C15.587 16.8211 15.6583 16.9457 15.6583 17.0825V19.5054C15.6583 19.682 15.5105 19.8258 15.3289 19.8258H9.67724C8.61958 19.8258 7.58881 19.6227 6.61315 19.2221C5.67055 18.8349 4.82163 18.282 4.09037 17.5783C3.35749 16.8734 2.78182 16.0547 2.37924 15.1451C1.9611 14.2008 1.74976 13.201 1.75073 12.1735C1.7517 11.146 1.95883 10.149 2.36595 9.2104C2.75913 8.30365 3.32216 7.48868 4.03883 6.7882C4.05861 6.76896 4.08454 6.75824 4.11176 6.75824C4.16914 6.75824 4.21614 6.80366 4.21614 6.85917V7.7861C4.21614 8.25571 4.60867 8.63765 5.09131 8.63765C5.57396 8.63765 5.96649 8.25571 5.96649 7.7861V5.60233C5.96649 5.48091 6.03878 5.36768 6.15093 5.31438C7.23258 4.79777 8.3956 4.536 9.6082 4.536C10.8208 4.536 11.87 4.77317 12.9073 5.24058C13.9095 5.69222 14.7883 6.33278 15.5189 7.14396C15.5827 7.21461 15.6113 7.30891 15.597 7.40195L15.5964 7.40101ZM11.4418 12.2413C11.4308 12.5554 11.3348 12.861 11.1643 13.126C10.9938 13.3912 10.7537 13.6095 10.4697 13.7564C10.2065 13.893 9.9083 13.9652 9.60815 13.9652C8.59618 13.9652 7.77319 13.1644 7.77319 12.1798C7.77319 11.1951 8.59651 10.3944 9.60815 10.3944C9.9083 10.3944 10.2062 10.4666 10.4697 10.6032C10.7537 10.7501 10.9938 10.9684 11.1643 11.2336C11.3348 11.4985 11.4308 11.8042 11.4418 12.1173V12.2413Z"
                    fill="#6CB6AD"
                  />
                  <path
                    d="M15.1631 9.84346C15.4918 10.5821 15.6584 11.3684 15.6584 12.1802C15.6584 12.992 15.4916 13.7779 15.1629 14.5165L15.1497 14.5462L16.6459 15.4564L16.6569 15.434C17.1557 14.4134 17.4086 13.3184 17.4086 12.1798C17.4086 11.0413 17.1557 9.94622 16.6569 8.92562L16.6459 8.90321L15.1501 9.81412L15.1631 9.84346Z"
                    fill="#6CB6AD"
                  />
                </svg>
                <span className="pl-2">1.5M</span>
              </div>
            </div>
            <div className={`flex items-center justify-between h-14 rounded-lg border w-1/3`}>
              <span className="px-8 text-xl">Stakers</span>
              <div className="flex items-center rounded-lg border text-2xl h-full px-4 w-1/3">
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.72152 10.8696C9.72152 11.0292 9.58648 11.1615 9.41991 11.1615H0.301606C0.137426 11.1615 0 11.0308 0 10.8696C0 8.28976 2.17624 6.19838 4.86076 6.19838C7.54528 6.19838 9.72152 8.28976 9.72152 10.8696ZM4.86076 5.61448C3.35071 5.61448 2.12658 4.43809 2.12658 2.98693C2.12658 1.53577 3.35071 0.359375 4.86076 0.359375C6.3708 0.359375 7.59494 1.53577 7.59494 2.98693C7.59494 4.43809 6.3708 5.61448 4.86076 5.61448Z"
                    fill="#6CB6AD"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24.0001 19.0912C24.0001 19.3573 23.7807 19.5778 23.51 19.5778H8.69275C8.42595 19.5778 8.20264 19.36 8.20264 19.0912C8.20264 14.7915 11.739 11.3059 16.1014 11.3059C20.4637 11.3059 24.0001 14.7915 24.0001 19.0912ZM16.1014 10.3327C13.6475 10.3327 11.6583 8.37207 11.6583 5.95347C11.6583 3.53488 13.6475 1.57422 16.1014 1.57422C18.5552 1.57422 20.5444 3.53488 20.5444 5.95347C20.5444 8.37207 18.5552 10.3327 16.1014 10.3327Z"
                    fill="#6CB6AD"
                  />
                </svg>

                <span className="pl-2">123K</span>
              </div>
            </div>
            <div className={`flex items-center justify-between h-14 rounded-lg border w-1/3`}>
              <span className="px-8 text-xl">Passport Stamps</span>
              <div className="flex items-center rounded-lg border text-2xl h-full px-4 w-1/3">
                <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.1955 7.11548V13.9333C18.1955 15.0111 17.609 16.0074 16.6574 16.5463L10.6363 19.9552C9.68471 20.4941 8.51172 20.4941 7.55914 19.9552L1.53813 16.5463C0.586494 16.0074 0 15.0111 0 13.9333V7.11548C0 6.03762 0.586494 5.04139 1.53813 4.50246L7.55914 1.09357C8.51078 0.554642 9.68376 0.554642 10.6363 1.09357L16.6574 4.50246C17.609 5.04139 18.1955 6.03762 18.1955 7.11548Z"
                    fill="#6CB6AD"
                  />
                </svg>
                <span className="pl-2">100K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageRoot>
  );
}
