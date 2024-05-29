import React, { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../../components/DoneToastContent";
import { Toast, useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useConnectedChain } from "@/utils/helpers";

export const onTxError = (txTitle: string, error: any, toast: typeof Toast) => {
  console.error(`${txTitle} failed:`, error);
  toast(
    makeErrorToastProps(
      "Failed",
      <div>
        <p>{txTitle} transaction failed</p>
        <p>
          Error: {error?.name}, Details: {error?.message}
        </p>
      </div>
    )
  );
};

export const onTxReceiptError = (txTitle: any, hash: any, receiptError: any, toast: typeof Toast, explorerUrl: any) => {
  console.error(`${txTitle} receipt failed, tx hash =`, hash, " error:", receiptError);
  toast(
    makeErrorToastProps(
      "Error",
      <div>
        <p>{txTitle} transaction failed to confirm</p>
        <p>
          See <a href={explorerUrl + "/" + hash}>details</a> on the block explorer
        </p>
      </div>
    )
  );
};

export const useStakeTxHandler = ({ txTitle, queryKey }: { txTitle: string; queryKey?: Readonly<Array<unknown>> }) => {
  const connectedChain = useConnectedChain();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: hash, error, isPending, isError, writeContract } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
    data: txReceipt
  } = useWaitForTransactionReceipt({
    hash,
  });
  const blockNumber = txReceipt?.blockNumber;

  useEffect(() => {
    (async () => {
      if (isConfirmed) {
        toast(makeSuccessToastProps("Success", `${txTitle} transaction confirmed`));
        if (queryKey) {
          // delay for indexer
          // maybe it would be better to wait for a few TX confirmations instead of delaying?
          await new Promise((resolve) => setTimeout(resolve, 10000));
          await queryClient.invalidateQueries({ queryKey });
        }
      }
    })();
  }, [isConfirmed, toast, queryClient, queryKey, txTitle]);

  useEffect(() => {
    if (isError) {
      onTxError(txTitle, error, toast);
    }
  }, [error, toast, txTitle, isError]);

  useEffect(() => {
    if (isReceiptError) {
      onTxReceiptError(txTitle, hash, receiptError, toast, connectedChain.explorer);
    }
  }, [isReceiptError, receiptError, toast, txTitle, hash, connectedChain.explorer]);

  const isLoading = isPending || isConfirming;

  return useMemo(
    () => ({
      blockNumber,
      isLoading,
      isConfirmed,
      writeContract,
    }),
    [blockNumber, isLoading, isConfirmed, writeContract]
  );
};
