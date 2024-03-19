import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../../components/DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useStakeTxHandler = ({
  queryKey,
  onConfirm,
  txTitle,
}: {
  queryKey: string[];
  onConfirm: () => void;
  txTitle: string;
}) => {
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
        // delay for indexer
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await queryClient.invalidateQueries({ queryKey });
      }
    })();
  }, [isConfirmed, toast, queryClient, queryKey]);

  useEffect(() => {
    if (isError) {
      console.error(`${txTitle} failed:`, error);
      toast(makeErrorToastProps("Failed", `${txTitle} transaction failed`));
    }
  }, [error, toast]);

  useEffect(() => {
    if (isReceiptError) {
      console.error(`${txTitle} receipt failed:`, receiptError);
      toast(makeErrorToastProps("Error", `${txTitle} transaction failed to confirm`));
    }
  }, [isReceiptError, receiptError, toast]);

  const isLoading = isPending || isConfirming;

  return {
    isLoading,
    writeContract,
  };
};
