import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { EthereumWebAuth } from "@didtools/pkh-ethereum";
import { DIDSession } from "did-session";
import { DID } from "dids";
import axios from "axios";
import { useAccount, useDisconnect } from "wagmi";
import { create } from "zustand";

// Adding the @ts-ignore below because of the following error:
//    Type error: Could not find a declaration file for module 'caip'. '/Users/nutrina/Projects/gitcoin/id-staking-v2-app/app/node_modules/caip/dist/index.mjs' implicitly has an 'any' type.
// @ts-ignore
import { AccountId } from "caip";
// import { MAX_VALID_DID_SESSION_AGE } from "@gitcoin/passport-identity";

import { Eip1193Provider } from "ethers";
import { createSignedPayload } from "../utils/helpers";

const BUFFER_TIME_BEFORE_EXPIRATION = 60 * 60 * 1000;

export type DbAuthTokenStatus = "idle" | "failed" | "connected" | "connecting";

const CERAMIC_CACHE_ENDPOINT = process.env.NEXT_PUBLIC_SCORER_ENDPOINT + "/ceramic-cache";

export type DatastoreConnectionContextState = {
  dbAccessTokenStatus: DbAuthTokenStatus;
  dbAccessToken?: string;
  did?: DID;
  connect: (address: string, provider: Eip1193Provider) => Promise<void>;
  connectedAddress?: string;
};

export const DatastoreConnectionContext = createContext<DatastoreConnectionContextState>({
  dbAccessTokenStatus: "idle",
  connect: async () => {},
});

const useDatastoreConnectionStore = create<
  Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "did" | "connectedAddress"> & {
    update: (
      data: Partial<
        Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "did" | "connectedAddress">
      >
    ) => void;
  }
>((set) => ({
  dbAccessTokenStatus: "idle",
  dbAccessToken: undefined,
  did: undefined,
  connectedAddress: undefined,
  update: (
    data: Partial<
      Pick<DatastoreConnectionContextState, "dbAccessTokenStatus" | "dbAccessToken" | "did" | "connectedAddress">
    >
  ) => set(data),
}));

// In the app, the context hook should be used. This is only exported for testing
export const useDatastoreConnection = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const { dbAccessTokenStatus, dbAccessToken, connectedAddress, did, update } = useDatastoreConnectionStore();

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
  }, [isConnected, dbAccessTokenStatus]);

  const getPassportDatabaseAccessToken = async (did: DID): Promise<string> => {
    let nonce = null;
    try {
      // Get nonce from server
      const nonceResponse = await axios.get(`${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/account/nonce`);
      nonce = nonceResponse.data.nonce;
    } catch (error) {
      const msg = `Failed to get nonce from server for user with did: ${did.parent}`;
      datadogRum.addError(msg);
      throw msg;
    }

    const payloadToSign = { nonce };
    const payloadForVerifier = {
      ...(await createSignedPayload(did, payloadToSign)),
      nonce,
    };

    try {
      const authResponse = await axios.post(`${CERAMIC_CACHE_ENDPOINT}/authenticate`, payloadForVerifier);
      const accessToken = authResponse.data?.access as string;
      return accessToken;
    } catch (error) {
      const msg = `Failed to authenticate user with did: ${did.parent}`;
      datadogRum.addError(msg);
      throw msg;
    }
  };

  const loadDbAccessToken = useCallback(async (address: string, did: DID): Promise<string> => {
    const dbCacheTokenKey = `dbcache-token-${address}`;
    // TODO: if we load the token from the localstorage we should validate it
    // let dbAccessToken = window.localStorage.getItem(dbCacheTokenKey);
    let dbAccessToken = null;

    // Here we try to get an access token for the Passport database
    // We should get a new access token:
    // 1. if the user has nonde
    // 2. in case a new session has been created (access tokens should expire similar to sessions)
    // TODO: verifying the validity of the access token would also make sense => check the expiration data in the token

    try {
      dbAccessToken = await getPassportDatabaseAccessToken(did);
      // Store the session in localstorage
      // @ts-ignore
      window.localStorage.setItem(dbCacheTokenKey, dbAccessToken);
      return dbAccessToken;
    } catch (error) {
      // Should we logout the user here? They will be unable to write to passport
      const msg = `Error getting access token for did: ${did}`;
      datadogRum.addError(msg);
      throw error;
    }
  }, []);

  const connect = useCallback(
    async (address: string, provider: Eip1193Provider) => {
      if (address) {
        try {
          const accountId = new AccountId({
            chainId: "eip155:1",
            address,
          });
          const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);

          let session: DIDSession = await DIDSession.get(accountId, authMethod, { resources: ["ceramic://*"] });

          if (session) {
            try {
              const newAccessToken = await loadDbAccessToken(address, session.did);
              update({
                did: session.did,
                dbAccessToken: newAccessToken,
                dbAccessTokenStatus: "connected",
                connectedAddress: address,
              });
            } catch (error) {
              update({
                dbAccessTokenStatus: "failed",
                dbAccessToken: undefined,
                connectedAddress: undefined,
                did: undefined,
              });
            }
          }
        } catch (error) {
          datadogRum.addError(error);
          disconnect();
          throw error;
        }
      }
    },
    [loadDbAccessToken, disconnect]
  );

  return {
    did,
    connect,
    dbAccessToken,
    dbAccessTokenStatus,
    connectedAddress,
  };
};

export const DatastoreConnectionContextProvider = ({ children }: { children: any }) => {
  const { dbAccessToken, dbAccessTokenStatus, connect, did, connectedAddress } = useDatastoreConnection();

  const providerProps = useMemo(
    () => ({
      did,
      connect,
      dbAccessToken,
      dbAccessTokenStatus,
      connectedAddress,
    }),
    [dbAccessToken, dbAccessTokenStatus, did, connect, connectedAddress]
  );

  return <DatastoreConnectionContext.Provider value={providerProps}>{children}</DatastoreConnectionContext.Provider>;
};

export const useDatastoreConnectionContext = () => useContext(DatastoreConnectionContext);
