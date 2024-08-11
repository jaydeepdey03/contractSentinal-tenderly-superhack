import { createContext, ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, EIP1193Provider, Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { ethers } from "ethers";

export const GlobalContext = createContext({
  fetchedAccount: null as Hex | null,
  connectWallet: async () => {},
  ethersSigner: null as any,
  walletClient: undefined as any,
  publicClient: undefined as any,
});

export default function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [fetchedAccount, setFetchAccount] = useState<Hex | null>(null);
  const [ethersSigner, setEthersSigner] = useState<any>(null);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

  const ethersProvider = new ethers.BrowserProvider(window.ethereum!);

  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        // await window.ethereum.request({method: "eth_requestAccounts"});

        const [address] = await walletClient.getAddresses();
        const signer = await ethersProvider.getSigner(address);
        setEthersSigner(signer);
        setFetchAccount(address);
      }
    })();
  }, [window, walletClient, ethersProvider]);

  async function connectWallet() {
    try {
      if (window.ethereum) {
        console.log("window.ethereum is present");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const [address] = await walletClient.requestAddresses();
        const signer = await ethersProvider.getSigner(address);
        setEthersSigner(signer);
        setFetchAccount(address);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        fetchedAccount,
        connectWallet,
        ethersSigner,
        walletClient,
        publicClient,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
