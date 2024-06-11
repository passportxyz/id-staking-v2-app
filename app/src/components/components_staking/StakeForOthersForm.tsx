import React, { ChangeEvent, useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/Button";
import { useAccount } from "wagmi";
import { StakeFormInputSection } from "./StakeFormInputSection";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { Chain, isAddress, parseEther } from "viem";
import { StakeForOthersModal } from "./StakeForOthersModal";
import { useCommunityStakeHistoryQuery } from "@/utils/stakeHistory";
import { getLockSeconds } from "@/utils/helpers";
import { useChainInitializing } from "@/hooks/staking_hooks/useChainInitialization";
import { getEnsAddress } from "@wagmi/core";
import { wagmiChains } from "@/utils/chains";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { wagmiConfig } from "@/utils/wagmi";

type StakeeError = "INVALID_ADDRESS" | "ENS_RESOLUTION_FAILED" | "DUPLICATE_ADDRESS";

type CommunityStakeInputs = {
  uuid: string;
  stakeeInput: string;
  amountInput: string;
  lockedPeriodMonths: number;
  autoFocus: boolean;
};

type CommunityStakeChainParams = {
  stakee: `0x${string}`;
  amount: bigint;
  lockedPeriodsSeconds: bigint;
  ensResolution?: string;
};

type CommunityStake = CommunityStakeInputs & CommunityStakeChainParams;

const createEmptyCommunityStake = (): CommunityStake => ({
  uuid: uuidv4(),
  stakeeInput: "",
  amountInput: "",
  lockedPeriodMonths: 3,
  amount: 0n,
  lockedPeriodsSeconds: BigInt(getLockSeconds(new Date(), 3)),
  stakee: "0x0",
  autoFocus: false,
});

const initialEmptyStake = createEmptyCommunityStake();

export const useCommunityStakesStore = create<{
  communityStakes: CommunityStake[];
  communityStakesById: Record<string, CommunityStake>;
  resetCommunityStakes: () => void;
  stakeSections: (typeof StakeForOthersFormSection)[];
  updateCommunityStake: (uuid: string, communityStake: Partial<CommunityStake>) => void;
  removeCommunityStake: (uuid: string) => void;
  addCommunityStake: () => void;
}>((set) => ({
  communityStakes: [initialEmptyStake],
  communityStakesById: { [initialEmptyStake.uuid]: initialEmptyStake },
  resetCommunityStakes: () =>
    set((state) => ({
      ...state,
      communityStakes: [initialEmptyStake],
      communityStakesById: { [initialEmptyStake.uuid]: initialEmptyStake },
    })),
  stakeSections: [],
  addCommunityStake: () =>
    set((state) => {
      const communityStake = createEmptyCommunityStake();
      return {
        ...state,
        communityStakes: [...state.communityStakes, communityStake],
        communityStakesById: { ...state.communityStakesById, [communityStake.uuid]: communityStake },
      };
    }),
  updateCommunityStake: (uuid: string, communityStake: Partial<CommunityStake>) =>
    set((state) => {
      if (communityStake.amountInput !== undefined) {
        communityStake.amount = parseEther(communityStake.amountInput);
      }

      if (communityStake.lockedPeriodMonths !== undefined) {
        communityStake.lockedPeriodsSeconds = BigInt(getLockSeconds(new Date(), communityStake.lockedPeriodMonths));
      }

      if (communityStake.stakeeInput !== undefined) {
        communityStake.stakee = communityStake.stakeeInput as `0x${string}`;
      }

      const newCommunityStake = {
        ...state.communityStakesById[uuid],
        autoFocus: false,
        ...communityStake,
      };
      return {
        ...state,
        communityStakes: state.communityStakes.map((cStake) => {
          return newCommunityStake.uuid === cStake.uuid ? newCommunityStake : cStake;
        }),
        communityStakesById: { ...state.communityStakesById, [uuid]: newCommunityStake },
      };
    }),
  removeCommunityStake: (uuid: string) =>
    set((state) => {
      const newCommunityStakesById = { ...state.communityStakesById };
      delete newCommunityStakesById[uuid];
      return {
        ...state,
        communityStakes: state.communityStakes.filter((cStake) => {
          return cStake.uuid !== uuid;
        }),
        communityStakesById: newCommunityStakesById,
      };
    }),
}));

const StakeForOthersFormSection = ({
  showClose,
  uuid,
  autoFocus,
  onChange,
  stakeeError,
}: {
  showClose: boolean;
  uuid: string;
  autoFocus?: boolean;
  onChange?: () => void;
  stakeeError?: StakeeError;
}) => {
  const communityStake = useCommunityStakesStore((state) => state.communityStakesById[uuid]);
  const updateCommunityStake = useCommunityStakesStore((state) => state.updateCommunityStake);
  const removeCommunityStake = useCommunityStakesStore((state) => state.removeCommunityStake);

  const setInputValue = useCallback(
    (value: string) => {
      onChange?.();
      updateCommunityStake(uuid, { amountInput: value });
    },
    [updateCommunityStake, uuid, onChange]
  );

  const setStakeeAddress = useCallback(
    async (inputValue: string) => {
      let ensResolution: string | undefined;
      const address = inputValue.trim();
      onChange?.();
      if (address.endsWith(".eth")) {
        // check for ens resolution
        const mainnetChain = wagmiChains.find((chain: Chain) => chain.id === mainnet.id);
        if (!mainnetChain) {
          return;
        }
        try {
          const ensAddress = await getEnsAddress(wagmiConfig, {
            chainId: mainnet.id,
            name: normalize(address),
          });
          if (ensAddress) {
            ensResolution = ensAddress;
          }
        } catch (e) {
          // Catching error here, as normalize might fail, and we don't want to crash
          console.error("Failed to resolve ENS name: ", address);
        }
      }
      updateCommunityStake(uuid, { stakeeInput: address as `0x${string}`, ensResolution });
    },
    [updateCommunityStake, uuid, onChange]
  );

  const setLockedPeriod = useCallback(
    (lockPeriod: number) => {
      onChange?.();
      updateCommunityStake(uuid, { lockedPeriodMonths: lockPeriod });
    },
    [updateCommunityStake, uuid, onChange]
  );

  const handleStakeeInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.();
      setStakeeAddress(event.target.value);
    },
    [setStakeeAddress, onChange]
  );

  return (
    <div className="w-full rounded-lg bg-gradient-to-b from-background to-background-5">
      <div className="w-full group rounded-t-lg border-r flex-col border-l border-t items-center border-foreground-4 bg-background-6 flex pt-6 pl-4 md:pl-14">
        <div className="w-full items-center flex gap-4">
          <div className="text-color-6 shrink-0 text-right font-bold w-[72px]">Address</div>
          <input
            className={`px-4 py-1 w-full rounded-lg border ${
              stakeeError ? "border-focus" : "border-foreground-4"
            } bg-background text-color-2 outline-none h-12 transition ease-in-out duration-200 border hover:border-foreground-2 focus:border-foreground-2`}
            type="text"
            value={communityStake.stakeeInput}
            placeholder="anotherperson.eth"
            onChange={handleStakeeInputChange}
          />
          <div
            className={`cursor-pointer ${showClose ? "visible" : "invisible"} w-4 mr-5`}
            onClick={() => {
              removeCommunityStake(uuid);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 1L1.00007 14.9999" stroke="#4C817A" />
              <path d="M15 15L1.00007 1.00006" stroke="#4C817A" />
            </svg>
          </div>
        </div>
        <div className="group-focus-within:text-transparent text-focus self-end my-1 h-6 mr-12 text-sm">
          {stakeeError === "ENS_RESOLUTION_FAILED"
            ? "Invalid ENS name"
            : stakeeError === "INVALID_ADDRESS"
            ? "Invalid Ethereum address"
            : stakeeError === "DUPLICATE_ADDRESS"
            ? "You have already staked on this address"
            : null}
        </div>
      </div>
      <StakeFormInputSection
        className="rounded-t-none"
        amount={communityStake.amountInput}
        lockedMonths={communityStake.lockedPeriodMonths}
        handleAmountChange={setInputValue}
        handleLockedMonthsChange={setLockedPeriod}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export const StakeForOthersForm = ({
  presetAddress,
  clearPresetAddress,
}: {
  presetAddress?: string;
  clearPresetAddress: () => void;
}) => {
  const { address } = useAccount();
  const { data, isPending } = useCommunityStakeHistoryQuery(address);
  const chainInitializing = useChainInitializing();

  const communityStakes = useCommunityStakesStore((state) => state.communityStakes);
  const addCommunityStake = useCommunityStakesStore((state) => state.addCommunityStake);
  const updateCommunityStake = useCommunityStakesStore((state) => state.updateCommunityStake);

  const previousStakedAddresses = useMemo(() => data?.map((stake) => stake.stakee.toLowerCase()) ?? [], [data]);
  const hasDuplicateAddresses = useMemo(
    () =>
      communityStakes
        .map((cStake) => cStake.stakee.toLowerCase())
        .find((address, idx, arr) => arr.indexOf(address) !== idx && address !== "0x0"),
    [communityStakes]
  );

  useEffect(() => {
    if (presetAddress && !isPending && !chainInitializing) {
      if (!previousStakedAddresses.includes(presetAddress.toLowerCase()) && communityStakes[0].stakeeInput === "") {
        updateCommunityStake(communityStakes[0].uuid, { stakeeInput: presetAddress, autoFocus: true });
      }
    }
  }, [presetAddress, isPending, communityStakes, updateCommunityStake, chainInitializing, previousStakedAddresses]);

  const stakeSections = useMemo(
    () =>
      communityStakes.map((communityStake, idx) => {
        const stakee = communityStake.stakeeInput.trim();
        let error: StakeeError | undefined;
        if (stakee.endsWith(".eth") && !communityStake.ensResolution) {
          error = "ENS_RESOLUTION_FAILED";
        } else if (stakee && !stakee.endsWith(".eth") && !isAddress(stakee)) {
          error = "INVALID_ADDRESS";
        } else if (
          previousStakedAddresses.includes(communityStake.stakee.toLowerCase()) ||
          (communityStake.stakee !== "0x0" &&
            communityStakes.findIndex(
              (cStake) => cStake.stakee.toLowerCase() === communityStake.stakee.toLowerCase()
            ) !== idx)
        ) {
          error = "DUPLICATE_ADDRESS";
        }

        return (
          <StakeForOthersFormSection
            key={idx}
            showClose={idx != 0}
            uuid={communityStake.uuid}
            autoFocus={communityStake.autoFocus}
            onChange={clearPresetAddress}
            stakeeError={error}
          />
        );
      }),
    [communityStakes, previousStakedAddresses, clearPresetAddress]
  );

  const anyIncomplete: boolean = useMemo(
    () =>
      Boolean(
        hasDuplicateAddresses ||
          communityStakes.find(
            (cStake) =>
              !(parseFloat(cStake.amountInput) > 0) || previousStakedAddresses.includes(cStake.stakee.toLowerCase())
          )
      ),
    [communityStakes, hasDuplicateAddresses, previousStakedAddresses]
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  const communityStakeModal = useMemo(
    () =>
      address ? (
        <StakeForOthersModal
          address={address}
          stakees={communityStakes.map((cStake) => {
            if (cStake.ensResolution) {
              return cStake.ensResolution as `0x${string}`;
            }
            return cStake.stakee;
          })}
          amounts={communityStakes.map((cStake) => cStake.amount)}
          lockedPeriodsSeconds={communityStakes.map((cStake) => cStake.lockedPeriodsSeconds)}
          isOpen={modalIsOpen}
          onClose={onClose}
        />
      ) : null,
    [address, communityStakes, modalIsOpen, onClose]
  );

  return (
    <div className="flex flex-col gap-4">
      {stakeSections}
      <div className="flex">
        <button className="flex-1 w-1/2 flex items-center" onClick={addCommunityStake}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15.5" stroke="#6CB6AD" />
            <path d="M16 8V24" stroke="#6CB6AD" />
            <path d="M24 16L8 16" stroke="#6CB6AD" />
          </svg>
          <span className="pl-4">Add another address</span>
        </button>
        <Button className="flex-1 w-1/2 font-bold h-14" onClick={() => setModalIsOpen(true)} disabled={anyIncomplete}>
          Stake
        </Button>
      </div>

      {communityStakeModal}
    </div>
  );
};
