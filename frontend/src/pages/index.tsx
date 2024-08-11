import Image from "next/image";
import { Inter } from "next/font/google";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/router";
import Navbar from "@/components/ui/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { getContract } from "viem";
import { auditMarketplaceAbi } from "@/lib/auditmarketplaceabi";

import useGlobalContextHook from "@/context/useGlobalContextHook";
import { ReloadIcon } from "@radix-ui/react-icons";
import { baseSepolia } from "viem/chains";

const inter = Inter({ subsets: ["latin"] });

const CONTRACT_ADDRESS = "0xA5Bb5243A32E0EC3e5956e49e3c733564a2A8339";

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { fetchedAccount, publicClient, walletClient } = useGlobalContextHook();

  const [loadingState, setLoadingState] = useState("idle"); // 'idle', 'docker', 'chain', 'done', 'error'

  const putItinDocker = async (
    repoOwner: string,
    repoName: string,
    branch: string,
    filePath: string,
    fileName: string,
  ) => {
    try {
      setLoadingState("docker");
      const { data } = await axios.post(`/api/create-contract`, {
        // const { fileName, repoOwner, repoName, filePath, branch } = req.body;
        fileName,
        repoOwner,
        repoName,
        branch,
        filePath,
      });
      console.log(data, "data in putItinDocker");
    } catch (error: any) {
      console.error(error.message, "error in putItinDocker");
      setLoadingState("error");
      setTimeout(() => {
        setLoadingState("idle");
      }, 2000);
    } finally {
      setLoadingState("idle");
    }
  };

  const getContractAndPutitOnChain = async (
    repoOwner: string,
    repoName: string,
    branch: string,
    filePath: string,
    fileName: string,
    githubLink: string,
  ) => {
    try {
      setLoadingState("chain");
      if (!repoOwner || !repoName || !branch || !filePath || !fileName || !githubLink || !fetchedAccount) return;

      const data2 = await axios.post(`/api/get-contract`, {
        repoOwner,
        repoName,
        filePath,
        branch,
      });

      const hash = await walletClient.writeContract({
        account: fetchedAccount,
        address: CONTRACT_ADDRESS,
        abi: auditMarketplaceAbi,
        functionName: "addContract",
        args: [data2.data.code, githubLink],
      });

      const tx = await publicClient.waitForTransactionReceipt({
        hash,
      });

      const unwatch = publicClient.watchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: auditMarketplaceAbi,
        eventName: "ContractAdded",
        // args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
        onLogs: (logs: any) => {
          const contractId = Number(logs[0].args.contractId);
          setOpen(false);
          router.push(`/audit/${contractId}`);
        },
      });

      console.log(unwatch, "unwatch in getContractAndPutitOnChain");

      console.log(tx, "tx in getContractAndPutitOnChain");
    } catch (error: any) {
      console.error(error.message, "error in getContractAndPutitOnChain");
      setLoadingState("error");
      setTimeout(() => {
        setLoadingState("idle");
      }, 2000);
    } finally {
      setLoadingState("idle");
    }
  };

  const [contractAudits, setContractAudits] = useState<any[]>([]);

  useEffect(() => {
    (async function () {
      try {
        const data = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: auditMarketplaceAbi,
          functionName: "getAllContracts",
        });

        console.log(data, "data in useEffect");
        setContractAudits(data);
      } catch (error: any) {
        console.error(error.message, "publicClient useEffect");
      }
    })();
  }, [loadingState]);

  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        console.log(accounts, "accounts from index");
        console.log(chainId, "chainId from index");
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

  return (
    <div className="h-screen w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new Contract Audit</DialogTitle>
            <DialogDescription>
              <Formik
                initialValues={{ githubLink: "" }}
                onSubmit={values => {
                  const { githubLink } = values;
                  const urlParts = githubLink.split("/");

                  const repoOwner = urlParts[3];
                  const repoName = urlParts[4];
                  const branch = urlParts[6];
                  const filePath = urlParts.slice(7).join("/");
                  const fileName = urlParts[urlParts.length - 1];
                  (async function () {
                    await putItinDocker(repoOwner, repoName, branch, filePath, fileName);
                    await getContractAndPutitOnChain(repoOwner, repoName, branch, filePath, fileName, githubLink);
                  })();
                }}
              >
                {formik => (
                  <Form>
                    <div className="mt-4 flex gap-3 flex-col">
                      <Label htmlFor="githubLink">Enter the Github link of the contract directory</Label>
                      <Field className="focus-visible:ring-0" as={Input} name="githubLink" id="githubLink" />
                    </div>
                    {loadingState === "idle" ? (
                      <Button type="submit" className="mt-4 w-full">
                        Submit
                      </Button>
                    ) : loadingState === "docker" ? (
                      <Button type="submit" className="mt-4 w-full" disabled>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Fetching Contract
                      </Button>
                    ) : loadingState === "chain" ? (
                      <Button type="submit" className="mt-4 w-full" disabled>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Adding to Chain
                      </Button>
                    ) : (
                      <Button type="submit" className="mt-4 w-full" disabled>
                        Error
                      </Button>
                    )}
                  </Form>
                )}
              </Formik>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Navbar setOpen={setOpen} />
      {contractAudits && contractAudits.length === 0 ? (
        <div className="w-full flex justify-center text-center pt-20" style={{ height: "calc(100vh - 80px)" }}>
          <p className="text-lg text-muted-foreground">No Contracts Audited Yet</p>
        </div>
      ) : (
        contractAudits && (
          <div
            className="w-full p-5 grid gap-4 h-fit"
            style={{
              // height: "calc(100vh - 80px)",
              gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr)`,
            }}
          >
            {contractAudits &&
              contractAudits.map((item, index) => (
                <div key={index} className="h-full w-full flex flex-col">
                  <Card className="h-fit w-full flex flex-col relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>ERC20 Contract</CardTitle>
                        <div>
                          <Badge>$99</Badge>
                        </div>
                      </div>
                      {/* <CardDescription>Audited Contract for ERC20</CardDescription> */}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        This is a ERC20 contract, the contract does minting and burning of tokens.
                      </p>
                    </CardContent>
                    <CardFooter className="mb-4">
                      <div className="h-full w-full flex items-center justify-between">
                        <div className="flex items-end">
                          <Avatar>
                            <AvatarImage src="/woman.png" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col ml-2">
                            <p className="text-sm">Shadcn</p>
                            <p className="text-xs">1 day ago</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={"outline"}
                          className="group"
                          onClick={() => router.push(`/audit/${index}`)}
                        >
                          Deploy
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 duration-100" />
                        </Button>
                      </div>
                    </CardFooter>

                    <div className="absolute bottom-0 right-0 h-[24px] rounded-b-lg border-t w-full text-xs flex items-center justify-center">
                      Audited by ChainSentinel
                    </div>
                  </Card>
                </div>
              ))}
          </div>
        )
      )}
    </div>
  );
}
