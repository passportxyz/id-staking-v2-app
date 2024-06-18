/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
// --- React Methods
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAccount, useConnect, useConnectors, useDisconnect, useSignMessage, useWalletClient } from "wagmi";
import axios from "axios";

// --- Components
import PageRoot from "../components/PageRoot";
import SIWEButton from "../components/SIWEButton";
import Footer from "../components/components_staking/Footer";
import { useDatastoreConnectionContext } from "../context/datastoreConnectionContext";
import { useToast } from "@chakra-ui/react";
import { DoneToastContent, makeErrorToastProps } from "../components/DoneToastContent";
import { PlatformCard, PlatformScoreSpec } from "../components/components_staking/PlatformCard";
import { TosModal } from "../components/components_staking/TosModal";
import { useMutation, useQuery, DefaultError, useQueryClient } from "@tanstack/react-query";
import { useNavigateWithCommonParams } from "@/hooks/hooks_staking/useNavigateWithCommonParams";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { isServerOnMaintenance } from "@/utils/helpers";
import { AccountCenter } from "@/components/AccountCenter";
import { StatsSection } from "@/components/StatsSection";

const SIGN_IN_CONTENT_MAX_WIDTH = "max-w-[1100px]";

export const useTosQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["tos", address || ""], [address]);
};
export const useTosMessageQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["tos-message", address || ""], [address]);
};

type TosAccepted = {
  accepted: boolean;
};

type TosMessageToSign = {
  text: string;
  nonce: string;
};

type TosSignedMessage = {
  tos_type: string;
  nonce: string;
  signature: string;
};

export const useTosQuery = (address: string | undefined) => {
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();
  const queryKey = useTosQueryKey(address);
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TosAccepted> => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/ceramic-cache/tos/accepted/IST/${address}`,
        {
          headers: {
            Authorization: `Bearer ${dbAccessToken}`,
          },
        }
      );
      return response.data as TosAccepted;
    },
    enabled: Boolean(address) && dbAccessTokenStatus === "connected",
  });
};

export const useTosGetMessageQuery = (address: string | undefined, accepted?: boolean) => {
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();
  const queryKey = useTosMessageQueryKey(address);
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TosMessageToSign> => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/ceramic-cache/tos/message-to-sign/IST/${address}`,
        {
          headers: {
            Authorization: `Bearer ${dbAccessToken}`,
          },
        }
      );
      return response.data as TosMessageToSign;
    },
    enabled: !accepted && Boolean(address) && dbAccessTokenStatus === "connected",
  });
};

export const useTosAcceptMutation = (address?: string) => {
  const { dbAccessToken } = useDatastoreConnectionContext();
  return useMutation<any, DefaultError, TosSignedMessage>({
    mutationFn: async (tosSigned: TosSignedMessage) => {
      console.log("Saving signature ...");
      await axios.post(
        `${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/ceramic-cache/tos/signed-message/IST/${address}`,
        tosSigned,
        {
          headers: {
            Authorization: `Bearer ${dbAccessToken}`,
          },
        }
      );
    },
  });
};

const useTos = () => {
  const { address } = useAccount();
  const tosCheck = useTosQuery(address);
  const tosMessageToSign = useTosGetMessageQuery(address, tosCheck.data?.accepted);
  const signer = useSignMessage();
  const acceptTos = useTosAcceptMutation(address);
  const isTosAccepted = tosCheck.isFetched && tosCheck.data?.accepted;
  const queryClient = useQueryClient();
  const tosQueryKey = useTosQueryKey(address);
  const toast = useToast();
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (tosMessageToSign.isError) {
      toast(
        makeErrorToastProps(
          "Error getting TOS to sign",
          <div>
            <p>{tosMessageToSign.error.message}</p>
            <p>Please try again ...</p>
          </div>
        )
      );
    }
  }, [tosMessageToSign.isError, tosMessageToSign.error]);

  useEffect(() => {
    if (tosCheck.isError) {
      toast(
        makeErrorToastProps(
          "Error checking TOS acceptance",
          <div>
            <p>{tosCheck.error.message}</p>
            <p>Please try again ...</p>
          </div>
        )
      );
    }
  }, [tosCheck.isError, tosCheck.error]);

  useEffect(() => {
    if (acceptTos.isError) {
      toast(
        makeErrorToastProps(
          "Error saving TOS acceptance signature",
          <div>
            <p>{acceptTos.error.message}</p>
            <p>Please try again ...</p>
          </div>
        )
      );
    }
  }, [acceptTos.isError, acceptTos.error]);

  useEffect(() => {
    if (signer.isError) {
      console.log("signer errors: ", signer.error);
      const cause = signer.error?.cause as Error;
      toast(
        makeErrorToastProps(
          `Error saving TOS acceptance signature: ${signer.error?.name}`,
          <div>
            <p>{cause?.message || signer.error?.message}</p>
            <p>Please try again ...</p>
          </div>
        )
      );
    }
  }, [signer.isError, signer.error]);

  const onAcceptTos = useCallback(async () => {
    console.log("accepting tos ...", tosMessageToSign.data);
    setIsSigning(true);
    if (tosMessageToSign.data) {
      try {
        const signature = await signer.signMessageAsync({ message: tosMessageToSign.data.text });
        await acceptTos.mutateAsync({
          tos_type: "IST",
          nonce: tosMessageToSign.data.nonce,
          signature: signature,
        });
        queryClient.invalidateQueries({ queryKey: tosQueryKey });
      } catch (error) {
        console.error("Error: ", error);
      }
    } else {
      console.error("tosMessageToSign.data is undefined");
    }
    setIsSigning(false);
  }, [tosMessageToSign.data, acceptTos, signer, queryClient, tosQueryKey]);

  return useMemo(
    () => ({ isTosAccepted, onAcceptTos, isPendingCheck: tosCheck.isPending || isSigning }),
    [isTosAccepted, onAcceptTos, tosCheck.isPending, isSigning]
  );
};

type LoginStep =
  | "NOT_STARTED"
  | "PENDING_WALLET_CONNECTION"
  | "PENDING_DATABASE_CONNECTION"
  | "PENDING_TOS_VERIFICATION"
  | "DONE";

// Isolate login status updates and some workaround logic for web3modal
const useLoginFlow = ({
  isTosAccepted,
}: {
  isTosAccepted?: boolean;
}): {
  loginStep: LoginStep;
  isLoggingIn: boolean;
  initiateLogin: () => void;
  resetLogin: () => void;
} => {
  const { isConnected } = useAccount();
  const { dbAccessTokenStatus } = useDatastoreConnectionContext();
  const { open: web3ModalIsOpen } = useWeb3ModalState();
  const [web3modalWasOpen, setWeb3modalWasOpen] = useState(false);
  const { disconnect } = useDisconnect();
  const [enabled, setEnabled] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("NOT_STARTED");

  useEffect(() => {
    const loginStep = (() => {
      // Stop login if web3modal was closed
      if (web3modalWasOpen && !web3ModalIsOpen && !isConnected) {
        setEnabled(false);
        return "NOT_STARTED";
      }

      if (!enabled) return "NOT_STARTED";
      else if (!isConnected) return "PENDING_WALLET_CONNECTION";
      else if (dbAccessTokenStatus !== "connected") return "PENDING_DATABASE_CONNECTION";
      else if (!isTosAccepted) return "PENDING_TOS_VERIFICATION";
      else return "DONE";
    })();
    setLoginStep(loginStep);
  }, [enabled, isConnected, dbAccessTokenStatus, isTosAccepted, web3ModalIsOpen, web3modalWasOpen]);

  // It takes a couple render cycles for web3ModalIsOpen to
  // be updated, so we need to keep track of the previous state
  useEffect(() => {
    setWeb3modalWasOpen(web3ModalIsOpen);
  }, [web3ModalIsOpen]);

  // Workaround for bug where if you disconnect from the modal on
  // the dashboard, the web3ModalIsOpen state is incorrect
  // until we call disconnect
  useEffect(() => {
    if (web3ModalIsOpen && loginStep === "NOT_STARTED") {
      disconnect();
    }
  }, [web3ModalIsOpen, loginStep]);

  const isLoggingIn = loginStep !== "DONE" && loginStep !== "NOT_STARTED";

  const initiateLogin = useCallback(() => {
    setEnabled(true);
  }, []);

  const resetLogin = useCallback(() => {
    setEnabled(false);
  }, []);

  return useMemo(
    () => ({ loginStep, isLoggingIn, initiateLogin, resetLogin }),
    [loginStep, isLoggingIn, initiateLogin, resetLogin]
  );
};

// Once we are out of the beta, we can rename this to Home and delete the above
export default function Home() {
  const { isConnected, address } = useAccount();
  const { open: openWeb3Modal } = useWeb3Modal();
  const { connect: connectDatastore } = useDatastoreConnectionContext();
  const { data: walletClient } = useWalletClient();
  const toast = useToast();
  const [tosModalIsOpen, setTosModalIsOpen] = useState(false);
  const isConnectingToDatabaseRef = useRef<boolean>(false);
  const navigate = useNavigateWithCommonParams();

  const { isPendingCheck, isTosAccepted, onAcceptTos } = useTos();

  const { loginStep, isLoggingIn, initiateLogin, resetLogin } = useLoginFlow({ isTosAccepted });

  const showConnectionError = useCallback(
    (e: any) => {
      toast({
        duration: 6000,
        isClosable: true,
        render: (result: any) => (
          <DoneToastContent
            title={"Connection Error"}
            body={(e as Error).message}
            icon="../assets/verification-failed-bright.svg"
            result={result}
          />
        ),
      });
    },
    [toast]
  );

  useEffect(() => {
    if (loginStep === "DONE") {
      navigate("/home");
    }
  }, [loginStep, navigate]);

  useEffect(() => {
    if (loginStep === "PENDING_TOS_VERIFICATION" && !isPendingCheck && !isTosAccepted) {
      setTosModalIsOpen(true);
    }
  }, [loginStep, isPendingCheck, isTosAccepted]);

  const signIn = useCallback(async () => {
    try {
      initiateLogin();
      if (!isConnected) {
        await openWeb3Modal();
      }
    } catch (e) {
      console.error("Error connecting wallet", e);
      showConnectionError(e);
      resetLogin();
    }
  }, [openWeb3Modal, isConnected, showConnectionError]);

  useEffect(() => {
    (async () => {
      if (
        !isConnectingToDatabaseRef.current &&
        loginStep === "PENDING_DATABASE_CONNECTION" &&
        address &&
        walletClient
      ) {
        isConnectingToDatabaseRef.current = true;
        console.log("Connecting to database");
        try {
          await connectDatastore(address, walletClient);
        } catch (e) {
          console.error("Error connecting to database", e);
          showConnectionError(e);
          resetLogin();
        }
        isConnectingToDatabaseRef.current = false;
      }
    })();
  }, [loginStep, address, walletClient, connectDatastore, showConnectionError]);

  const closeTosModal = useCallback(() => {
    setTosModalIsOpen(false);
    resetLogin();
  }, []);

  const gtcStakingStampPlatform: PlatformScoreSpec = {
    name: "GTC Staking",
    description: "Stake GTC to boost your trust in the Gitcoin ecosystem.",
    possiblePoints: 14.18,
    earnedPoints: 0,
    icon: "./assets/gtcStakingLogoIcon.svg",
    connectMessage: "Connect Wallet",
  };

  const maintenanceMode = useMemo(isServerOnMaintenance, []);

  return (
    <PageRoot className="text-color-2 min-h-screen" backgroundGradientStyle="top-only">
      <div className="min-h-screen flex flex-col">
        {isConnected && <AccountCenter />}
        <TosModal
          isOpen={tosModalIsOpen}
          onClose={closeTosModal}
          onButtonClick={onAcceptTos}
          isPending={isPendingCheck}
        />
        <div
          className={`flex flex-col grow h-full items-center justify-evenly w-full self-center p-8 ${SIGN_IN_CONTENT_MAX_WIDTH}`}
        >
          <div className="absolute top-0 right-0 h-auto gradient-mask-t-0 md:h-full md:w-auto md:gradient-mask-l-0">
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
                  <stop offset="1" stopColor="#122B33" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-flow-row gap-4 lg:grid-flow-col w-full z-10">
            <div className="">
              <div className="col-span-2 font-heading text-4xl md:text-6xl lg:row-start-2 text-foreground-2">
                Increase Your
                <br />
                Passport Score
              </div>
              <div className="col-span-2 mb-4 text-2xl leading-none text-foreground-2 md:text-5xl"></div>
              <div className="col-span-2 max-w-md text-sm lg:max-w-sm text-foreground">
                Increase your Passport’s Cost of Forgery while also increasing your Unique Humanity Score. Staking GTC
                allows real humans to attest to their unique humanity and builds financial incentives to be a good
                actor.
              </div>
              <SIWEButton
                enableEthBranding={false}
                data-testid="connectWalletButton"
                onClick={signIn}
                className="col-span-2 mt-4 lg:w-3/4"
                isLoading={isLoggingIn}
                disabled={maintenanceMode}
                subtext={(() => {
                  if (loginStep === "PENDING_WALLET_CONNECTION") {
                    return "Connect your wallet";
                  } else if (loginStep === "PENDING_DATABASE_CONNECTION") {
                    return "Sign message in wallet";
                  } else if (loginStep === "PENDING_TOS_VERIFICATION") {
                    return "Accept the terms of service";
                  }
                })()}
              />
            </div>
            <div className="hidden lg:flex justify-center">
              <PlatformCard platform={gtcStakingStampPlatform} className="ml-24 mt-12" />
            </div>
          </div>
          <StatsSection className="mt-10 mb-4 w-full z-10" />
        </div>
        <Footer />
      </div>
    </PageRoot>
  );
}
