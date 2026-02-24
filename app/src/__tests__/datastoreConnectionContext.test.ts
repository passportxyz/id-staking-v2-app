import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// vi.hoisted – runs before anything else, including vi.mock factories.
// We set the env var here so that the module-level const
//   CERAMIC_CACHE_ENDPOINT = process.env.NEXT_PUBLIC_SCORER_ENDPOINT + "/ceramic-cache"
// picks up the correct value when the module is first imported.
// ---------------------------------------------------------------------------
const SCORER_ENDPOINT = "https://api.test.com";

const { zustandStores } = vi.hoisted(() => {
  // Set env var in the hoisted scope so it is available before any module loads
  process.env.NEXT_PUBLIC_SCORER_ENDPOINT = "https://api.test.com";

  const zustandStores: Array<{ setState: (s: any) => void; getState: () => any }> = [];
  return { zustandStores };
});

// ---------------------------------------------------------------------------
// Mock modules – vi.mock calls are hoisted by vitest to the top of the file
// ---------------------------------------------------------------------------

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("viem/siwe", () => ({
  createSiweMessage: vi.fn(() => "mock-siwe-message-string"),
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({ isConnected: true, address: "0xTestAddress" })),
  useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
}));

vi.mock("@datadog/browser-rum", () => ({
  datadogRum: { addError: vi.fn() },
}));

// Intercept zustand's `create` so we can grab a reference to each store and
// reset it between tests.  We keep the real implementation; we just capture
// store references.
vi.mock("zustand", async () => {
  const actual: any = await vi.importActual("zustand");
  return {
    ...actual,
    create: (...args: any[]) => {
      const store = actual.create(...args);
      zustandStores.push(store);
      return store;
    },
  };
});

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

import axios from "axios";
import { createSiweMessage } from "viem/siwe";
import { datadogRum } from "@datadog/browser-rum";
import { useDatastoreConnection } from "../context/datastoreConnectionContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_ADDRESS = "0xTestAddress";
const TEST_NONCE = "random-nonce-abc123";
const TEST_JWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test-token";

/** A minimal mock WalletClient that satisfies the code under test. */
const createMockWalletClient = () => ({
  signMessage: vi.fn().mockResolvedValue("0xmocked-signature"),
});

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("useDatastoreConnection – SIWE authentication flow", () => {
  let mockWalletClient: ReturnType<typeof createMockWalletClient>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SCORER_ENDPOINT = SCORER_ENDPOINT;

    // Stub window.location (jsdom sets it, but we want deterministic values)
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        host: "app.passport.xyz",
        origin: "https://app.passport.xyz",
      },
    });

    // localStorage stub
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});

    mockWalletClient = createMockWalletClient();

    // Default happy-path mocks
    vi.mocked(axios.get).mockResolvedValue({
      data: { nonce: TEST_NONCE },
    });

    vi.mocked(axios.post).mockResolvedValue({
      data: { access: TEST_JWT },
    });

    vi.mocked(createSiweMessage).mockReturnValue("mock-siwe-message-string");

    // Reset all zustand stores to their initial state so tests are isolated
    for (const store of zustandStores) {
      store.setState({
        dbAccessTokenStatus: "idle",
        dbAccessToken: undefined,
        connectedAddress: undefined,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Successful SIWE auth flow
  // -----------------------------------------------------------------------
  it("completes the full SIWE authentication flow successfully", async () => {
    const { result } = renderHook(() => useDatastoreConnection());

    await act(async () => {
      await result.current.connect(TEST_ADDRESS, mockWalletClient as any);
    });

    // -- Step 1: nonce fetched --
    expect(axios.get).toHaveBeenCalledWith(`${SCORER_ENDPOINT}/account/nonce`);

    // -- Step 2: createSiweMessage called with correct params --
    expect(createSiweMessage).toHaveBeenCalledTimes(1);
    const siweCall = vi.mocked(createSiweMessage).mock.calls[0][0] as Record<string, unknown>;

    expect(siweCall.domain).toBe("app.passport.xyz");
    expect(siweCall.address).toBe(TEST_ADDRESS);
    expect(siweCall.statement).toBe("Sign in to Human Passport");
    expect(siweCall.uri).toBe("https://app.passport.xyz");
    expect(siweCall.version).toBe("1");
    expect(siweCall.chainId).toBe(1);
    expect(siweCall.nonce).toBe(TEST_NONCE);
    expect(siweCall.issuedAt).toBeInstanceOf(Date);
    expect(siweCall.expirationTime).toBeInstanceOf(Date);

    // -- Step 3: wallet signs the message --
    expect(mockWalletClient.signMessage).toHaveBeenCalledWith({
      account: TEST_ADDRESS,
      message: "mock-siwe-message-string",
    });

    // -- Step 4: POST to authenticate with SIWE params and signature --
    expect(axios.post).toHaveBeenCalledTimes(1);
    const [postUrl, postBody] = vi.mocked(axios.post).mock.calls[0] as [string, Record<string, any>];
    expect(postUrl).toBe(`${SCORER_ENDPOINT}/ceramic-cache/authenticate/v2`);
    expect(postBody).toHaveProperty("signature", "0xmocked-signature");
    expect(postBody).toHaveProperty("message");

    // -- KEY ASSERTION: issuedAt and expirationTime are present in the message object sent to the backend --
    expect(postBody.message).toHaveProperty("issuedAt");
    expect(postBody.message.issuedAt).toBeInstanceOf(Date);
    expect(postBody.message).toHaveProperty("expirationTime");
    expect(postBody.message.expirationTime).toBeInstanceOf(Date);

    // -- Step 5: store is updated --
    expect(result.current.dbAccessTokenStatus).toBe("connected");
    expect(result.current.dbAccessToken).toBe(TEST_JWT);
    expect(result.current.connectedAddress).toBe(TEST_ADDRESS);
  });

  // -----------------------------------------------------------------------
  // 2. Nonce fetch failure
  // -----------------------------------------------------------------------
  it("sets status to 'failed' and reports to datadog when nonce fetch fails", async () => {
    const nonceError = new Error("Network Error");
    vi.mocked(axios.get).mockRejectedValueOnce(nonceError);

    const { result } = renderHook(() => useDatastoreConnection());

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.connect(TEST_ADDRESS, mockWalletClient as any);
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeDefined();
    expect(result.current.dbAccessTokenStatus).toBe("failed");
    expect(result.current.dbAccessToken).toBeUndefined();

    expect(datadogRum.addError).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 3. Wallet signature rejection
  // -----------------------------------------------------------------------
  it("sets status to 'failed' when the wallet rejects the signature request", async () => {
    mockWalletClient.signMessage.mockRejectedValueOnce(new Error("User rejected request"));

    const { result } = renderHook(() => useDatastoreConnection());

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.connect(TEST_ADDRESS, mockWalletClient as any);
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe("User rejected request");
    expect(result.current.dbAccessTokenStatus).toBe("failed");
    expect(result.current.dbAccessToken).toBeUndefined();
    expect(result.current.connectedAddress).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // 4. Auth POST failure
  // -----------------------------------------------------------------------
  it("sets status to 'failed' when the auth POST request fails", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("401 Unauthorized"));

    const { result } = renderHook(() => useDatastoreConnection());

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.connect(TEST_ADDRESS, mockWalletClient as any);
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe("401 Unauthorized");
    expect(result.current.dbAccessTokenStatus).toBe("failed");
    expect(result.current.dbAccessToken).toBeUndefined();
    expect(result.current.connectedAddress).toBeUndefined();
    expect(datadogRum.addError).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 5. Race condition deduplication
  // -----------------------------------------------------------------------
  it("deduplicates concurrent connect() calls – only one nonce request fires", async () => {
    const { result } = renderHook(() => useDatastoreConnection());

    // Fire two connect() calls without awaiting in between
    await act(async () => {
      const p1 = result.current.connect(TEST_ADDRESS, mockWalletClient as any);
      const p2 = result.current.connect(TEST_ADDRESS, mockWalletClient as any);
      await Promise.all([p1, p2]);
    });

    // Only one full flow should have executed
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // 6. SIWE params match Passport reference format
  // -----------------------------------------------------------------------
  it("sends SIWE params that match the Passport reference format exactly", async () => {
    const { result } = renderHook(() => useDatastoreConnection());

    await act(async () => {
      await result.current.connect(TEST_ADDRESS, mockWalletClient as any);
    });

    const siweParams = vi.mocked(createSiweMessage).mock.calls[0][0] as Record<string, unknown>;

    // Verify every expected field is present with the correct type / value
    const expectedShape = {
      domain: "app.passport.xyz",
      address: TEST_ADDRESS,
      statement: "Sign in to Human Passport",
      uri: "https://app.passport.xyz",
      version: "1",
      chainId: 1,
      nonce: TEST_NONCE,
    };

    for (const [key, value] of Object.entries(expectedShape)) {
      expect(siweParams[key]).toBe(value);
    }

    // issuedAt and expirationTime must be Date instances
    expect(siweParams.issuedAt).toBeInstanceOf(Date);
    expect(siweParams.expirationTime).toBeInstanceOf(Date);

    // Verify no extra unexpected fields leak in
    const actualKeys = Object.keys(siweParams).sort();
    const expectedKeys = [...Object.keys(expectedShape), "issuedAt", "expirationTime"].sort();
    expect(actualKeys).toEqual(expectedKeys);

    // Also verify the POST body forwards the same params object
    const postBody = vi.mocked(axios.post).mock.calls[0][1] as Record<string, unknown>;
    const msgInBody = postBody.message as Record<string, unknown>;

    expect(msgInBody.domain).toBe("app.passport.xyz");
    expect(msgInBody.address).toBe(TEST_ADDRESS);
    expect(msgInBody.statement).toBe("Sign in to Human Passport");
    expect(msgInBody.uri).toBe("https://app.passport.xyz");
    expect(msgInBody.version).toBe("1");
    expect(msgInBody.chainId).toBe(1);
    expect(msgInBody.nonce).toBe(TEST_NONCE);
    expect(msgInBody.issuedAt).toBeInstanceOf(Date);
  });
});
