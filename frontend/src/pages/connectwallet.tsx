import { Button } from "@/components/ui/button";
import useGlobalContextHook from "@/context/useGlobalContextHook";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { baseSepolia } from "viem/chains";

export default function ConnectWallet() {
  const ethersProvider = new ethers.BrowserProvider(window.ethereum!);
  const router = useRouter();

  const { walletClient, setEthersSigner, chainId, fetchedAccount } = useGlobalContextHook();

  async function connectWallet() {
    try {
      if (window.ethereum && walletClient) {
        console.log("window.ethereum is present");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const [address] = await walletClient.requestAddresses();
        const signer = await ethersProvider.getSigner(address);
        setEthersSigner(signer);
        router.push(`/`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function switchChainMetamask() {
    try {
      if (window.ethereum && walletClient) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== baseSepolia.id) {
          await walletClient.switchChain({
            id: baseSepolia.id,
          });
        }
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  return (
    <div className="h-screen w-full flex justify-center items-center">
      {!fetchedAccount ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        fetchedAccount &&
        chainId !== baseSepolia.id && <Button onClick={switchChainMetamask}>Switch to Sepolia Chain</Button>
      )}
    </div>
  );
}
