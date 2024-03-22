import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../../components/DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useConnectedChain } from "@/utils/helpers";

export const useStakeTxHandler = ({
  onConfirm,
  txTitle,
  queryKey,
}: {
  onConfirm: () => void;
  txTitle: string;
  queryKey?: string[];
}) => {
  const connectedChain = useConnectedChain();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: hash, error, isPending, isError, writeContract } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    (async () => {
      if (isConfirmed) {
        toast(makeSuccessToastProps("Success", `${txTitle} transaction confirmed`));
        onConfirm();
        if (queryKey) {
          // delay for indexer
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await queryClient.invalidateQueries({ queryKey });
        }
      }
    })();
  }, [isConfirmed, toast, queryClient, queryKey, txTitle, onConfirm]);

  useEffect(() => {
    if (isError) {
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
    }
  }, [error, toast, txTitle, isError]);

  useEffect(() => {
    if (isReceiptError) {
      console.error(`${txTitle} receipt failed, tx hash =`, hash, " error:", receiptError);
      toast(
        makeErrorToastProps(
          "Error",
          <div>
            <p>{txTitle} transaction failed to confirm</p>
            <p>
              See <a href={connectedChain.explorer + "/" + hash}>details</a> on the block explorer
            </p>
          </div>
        )
      );
    }
  }, [isReceiptError, receiptError, toast, txTitle, hash, connectedChain.explorer]);

  const isLoading = isPending || isConfirming;

  return {
    isLoading,
    writeContract,
  };
};
