import { createContext, ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, EIP1193Provider, Hex, publicActions } from "viem";
import { baseSepolia } from "viem/chains";
import { ethers } from "ethers";
import { useRouter } from "next/router";

export const GlobalContext = createContext({
  fetchedAccount: null as Hex | null,
  ethersSigner: null as any,
  walletClient: undefined as any,
  publicClient: undefined as any,
  setEthersSigner: (signer: any) => {},
  setFetchAccount: (account: Hex) => {},
  chainId: null as number | null,
});

export default function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [fetchedAccount, setFetchAccount] = useState<Hex | null>(null);
  const [ethersSigner, setEthersSigner] = useState<any>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const router = useRouter();

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

  useEffect(() => {
    (async function () {
      // if (window.ethereum) {
      //   // await window.ethereum.request({method: "eth_requestAccounts"});
      //   // await walletClient.switchChain({
      //   //   id: baseSepolia.id,
      //   // });
      //   // const [address] = await walletClient.getAddresses();
      //   // const signer = await ethersProvider.getSigner(address);
      //   // setEthersSigner(signer);
      //   // setFetchAccount(address);

      // }

      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        console.log(accounts, "accounts");
        if (accounts.length === 0 && chainId !== baseSepolia.id) {
          router.push("/connectwallet");
        }

        if (parseInt(chainId, 16) !== baseSepolia.id) {
          router.push("/connectwallet");
        }

        // if chianid is fine, account is fine, then move to home page
        if (parseInt(chainId, 16) === baseSepolia.id && fetchedAccount) {
          router.push("/");
        }
      }
    })();
  }, [window]);

  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        console.log(accounts, "accounts");
        if (accounts.length != 0) {
          setFetchAccount(accounts[0]);
        }
      }
    })();
  }, [window]);

  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        console.log(chainId, "chainId");

        setChainId(parseInt(chainId, 16));
      }
    })();
  }, [window]);

  console.log(fetchedAccount, "fetchedAccount");

  return (
    <GlobalContext.Provider
      value={{
        fetchedAccount,
        ethersSigner,
        walletClient,
        publicClient,
        setEthersSigner,
        setFetchAccount,
        chainId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
