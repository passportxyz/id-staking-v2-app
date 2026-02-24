import React, { createContext, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { createSiweMessage } from "viem/siwe";
import type { WalletClient } from "viem";
import axios from "axios";
import { useAccount, useDisconnect } from "wagmi";
import { create } from "zustand";

export type DbAuthTokenStatus = "idle" | "failed" | "connected" | "connecting";

const CERAMIC_CACHE_ENDPOINT = process.env.NEXT_PUBLIC_SCORER_ENDPOINT + "/ceramic-cache";

export type DatastoreConnectionContextState = {
  dbAccessTokenStatus: DbAuthTokenStatus;
  dbAccessToken?: string;
  connect: (address: string, walletClient: WalletClient) => Promise<void>;
  connectedAddress?: string;
};

export const DatastoreConnectionContext = createContext<DatastoreConnectionContextState>({
  dbAccessTokenStatus: "idle",
  connect: async () => {},
});

const useDatastoreConnectionStore = create<
  Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "connectedAddress"> & {
    update: (
      data: Partial<
        Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "connectedAddress">
      >
    ) => void;
  }
>((set) => ({
  dbAccessTokenStatus: "idle",
  dbAccessToken: undefined,
  connectedAddress: undefined,
  update: (
    data: Partial<
      Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "connectedAddress">
    >
  ) => set(data),
}));

type NonceResponse = { nonce: string };
type AuthResponse = { access: string };

const getPassportDatabaseAccessToken = async (
  address: string,
  walletClient: WalletClient
): Promise<string> => {
  const { data: { nonce } } = await axios.get<NonceResponse>(
    `${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/account/nonce`
  );

  const siweParams = {
    domain: window.location.host,
    address: address as `0x${string}`,
    statement: "Sign in to Human Passport",
    uri: window.location.origin,
    version: "1" as const,
    chainId: 1,
    nonce,
    issuedAt: new Date(),
  };

  const message = createSiweMessage(siweParams);

  const signature = await walletClient.signMessage({
    account: address as `0x${string}`,
    message,
  });

  const { data } = await axios.post<AuthResponse>(
    `${CERAMIC_CACHE_ENDPOINT}/authenticate/v2`,
    { message: siweParams, signature }
  );

  return data.access;
};

// In the app, the context hook should be used. This is only exported for testing
export const useDatastoreConnection = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const { dbAccessTokenStatus, dbAccessToken, connectedAddress, update } = useDatastoreConnectionStore();

  /**
   * The purpose of this useEffect is to disconnect the user if the address of the wallet changes
   * We want to avoid being connected to the BE with 1 address and with another address in the wallet
   * as this is an undesired state
   */
  useEffect(() => {
    if (address !== connectedAddress && dbAccessTokenStatus !== "idle") {
      disconnect();
    }
  }, [address, connectedAddress, dbAccessTokenStatus, disconnect]);

  useEffect(() => {
    // Clear status when wallet disconnected
    if (!isConnected && dbAccessTokenStatus === "connected") {
      console.log("Clearing dbAccessTokenStatus");
      update({
        dbAccessTokenStatus: "idle",
        dbAccessToken: undefined,
      });
    }
  }, [isConnected, dbAccessTokenStatus, update]);

  const loadDbAccessToken = useCallback(async (address: string, walletClient: WalletClient): Promise<string> => {
    const dbCacheTokenKey = `dbcache-token-${address}`;

    try {
      const dbAccessToken = await getPassportDatabaseAccessToken(address, walletClient);
      window.localStorage.setItem(dbCacheTokenKey, dbAccessToken);
      return dbAccessToken;
    } catch (error) {
      const msg = `Error getting access token for address: ${address}`;
      datadogRum.addError(msg);
      throw error;
    }
  }, []);

  const connectInFlightRef = useRef<Promise<void> | null>(null);

  const connect = useCallback(
    async (address: string, walletClient: WalletClient) => {
      if (connectInFlightRef.current) return connectInFlightRef.current;
      connectInFlightRef.current = (async () => {
        try {
          if (!address) return;
          const newAccessToken = await loadDbAccessToken(address, walletClient);
          update({
            dbAccessToken: newAccessToken,
            dbAccessTokenStatus: "connected",
            connectedAddress: address,
          });
        } catch (error) {
          update({
            dbAccessTokenStatus: "failed",
            dbAccessToken: undefined,
            connectedAddress: undefined,
          });
          datadogRum.addError(error);
          throw error;
        } finally {
          connectInFlightRef.current = null;
        }
      })();
      return connectInFlightRef.current;
    },
    [loadDbAccessToken, update]
  );

  return {
    connect,
    dbAccessToken,
    dbAccessTokenStatus,
    connectedAddress,
  };
};

export const DatastoreConnectionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { dbAccessToken, dbAccessTokenStatus, connect, connectedAddress } = useDatastoreConnection();

  const providerProps = useMemo(
    () => ({
      connect,
      dbAccessToken,
      dbAccessTokenStatus,
      connectedAddress,
    }),
    [dbAccessToken, dbAccessTokenStatus, connect, connectedAddress]
  );

  return <DatastoreConnectionContext.Provider value={providerProps}>{children}</DatastoreConnectionContext.Provider>;
};

export const useDatastoreConnectionContext = () => useContext(DatastoreConnectionContext);
