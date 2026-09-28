"use client";

import {
  getWalletAccount,
  getWalletTransactions,
  subscribeWallet,
} from "@/features/wallet/lib/store";
import { SEED_WALLET_ACCOUNT, SEED_WALLET_TRANSACTIONS } from "@/features/wallet/constants";
import type { WalletAccount, WalletTransaction } from "@/shared/types/dashboard";
import { useEffect, useState } from "react";

export function useWallet() {
  const [account, setAccount] = useState<WalletAccount>(() => ({ ...SEED_WALLET_ACCOUNT }));
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => [
    ...SEED_WALLET_TRANSACTIONS,
  ]);

  useEffect(() => {
    const sync = () => {
      setAccount(getWalletAccount());
      setTransactions(getWalletTransactions());
    };
    sync();
    return subscribeWallet(sync);
  }, []);

  return { account, transactions };
}
