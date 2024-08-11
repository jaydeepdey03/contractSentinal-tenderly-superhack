// https://base-sepolia.easscan.org/schema/view/0xe42802fb8300245889f7fc7ade0a4240223b5a5a8dfe6d0976a75accce17e556
// 0x145a7774aa7060D983309315cb77c0c4DCe0fF58
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { BadgeX, CircleAlert, InfoIcon, Laugh, Plus, SlidersVerticalIcon, SquareFunction } from "lucide-react";
import { useRouter } from "next/router";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/ui/Navbar";
import { useEffect, useState } from "react";
import useGlobalContextHook from "@/context/useGlobalContextHook";
import { auditMarketplaceAbi } from "@/lib/auditmarketplaceabi";
import axios from "axios";
import { createPublicClient, custom } from "viem";
import { baseSepolia } from "viem/chains";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xfb3eb41E32CB08965e7FFE95FFD9Bb01D1d631d8";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = "0xe42802fb8300245889f7fc7ade0a4240223b5a5a8dfe6d0976a75accce17e556";

const eas = new EAS(easContractAddress);

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL!);

const wallet = new ethers.Wallet(privateKey, provider);

console.log(wallet, "platform signer");

export default function Audits() {
  const router = useRouter();
  const [infoOpen, setInfoOpen] = useState(false);

  const id = router.query.auditId;
  console.log(id, "id");
  const { fetchedAccount, walletClient, ethersSigner, setEthersSigner } = useGlobalContextHook();
  const [contractAudits, setContractAudits] = useState<any>();
  const [contractCode, setContractCode] = useState<string>();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

  useEffect(() => {

    const extractFunctions = () => {
      console.log(contractCode, "extract functions");

      // Split the code by the keyword 'function'
      const parts = contractCode?.split("function");

      // Filter out and re-add the 'function' keyword to valid function blocks
      const functions = parts!
        .slice(1) // Skip the first part since it will be before the first 'function' keyword
        .map(part => "function" + part.split("}")[0] + "}");

      // Print the matched functions
      functions.forEach((func, index) => {
        console.log(`Function ${index + 1}:\n${func}\n`);
      });

      return functions;
    };


    if (contractCode) {
      const functions = extractFunctions();

      for (let index = 0; index < functions.length; index++) {
        const code = functions[index];

        const regex = /function\s+(\w+)\(([^)]*)\)/;

        // Apply the regex to extract the function name and arguments
        const match = code.match(regex);

        if (match) {
          const functionName = match[1]; // Extracts the function name
          const functionArgs = match[2]; // Extracts the arguments

          console.log("Function Name:", functionName); // Output: getName
          console.log("Arguments:", functionArgs); // Output: address name
        } else {
          console.log("No match found");
        }

      }

    }

  }, [contractCode])


  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setEthersSigner(await new ethers.BrowserProvider(window.ethereum).getSigner());
      }
    })();
  }, [window]);

  useEffect(() => {
    (async function () {
      try {
        if (id) {
          const data1: any = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: auditMarketplaceAbi,
            functionName: "getContract",
            args: [parseInt(id as string)],
          });

          console.log(data1, "data in audit");

          if (data1 && (data1 as any)[5]) {
            const url = (data1 as any)[5] as string;
            const urlParts = data1[5].split("/");
            const repoOwner = urlParts[3];
            const repoName = urlParts[4];
            const branch = urlParts[6];

            const filePath = url.split(`/${branch}/`)[1];

            console.log(filePath, "filepath");

            // // const { repoOwner, repoName, filePath, branch } = req.body;
            const data2 = await axios.post(`/api/get-contract`, {
              repoOwner,
              repoName,
              filePath,
              branch,
            });

            console.log(data2.data, "data2");

            setContractCode(data2.data.code);
          }

          setContractAudits(data1);
        }
      } catch (error: any) {
        console.error(error.message, "error in audit");
      }
    })();
  }, [id]);

  const [aiReport, setAIReport] = useState<any[]>([
    {
      functionName: "getName",
      result: "good",
      explanation:
        "The function is a simple getter function that returns the address passed as an argument. It does not modify any state and is purely functional. There are no security issues or areas for improvement in this code.",
    },
    {
      functionName: "setName",
      result: "improvement",
      explanation:
        "The function lacks an event to log the name change, which can be beneficial for auditing and tracking purposes. It is recommended to add an event like `NameChanged(string newName)` to emit the new name when it's set.",
    },
  ]);

  type Audit = {
    functionName: string;
    result: string;
    explanation: string;
  };

  const [reportLoading, setReportLoading] = useState("idle"); // 'ai', 'attestation', 'error', 'idle'

  async function createAttestation(auditArray: Audit[], contractAddress: string, auditId: string) {
    try {
      setReportLoading("attestation");

      if (!privateKey && window.ethereum) {
        console.log("No signer found and no window ethereum");
        return;
      }

      await eas.connect(wallet);
      // const offchain = await eas.getOffchain();

      const schemaEncoder = new SchemaEncoder(
        "address contract_address,string audit_id,string[] audit_response,string commit_id",
      );

      // Cannot read properties of null (reading 'schema')
      const encodedData = schemaEncoder.encodeData([
        {
          name: "contract_address",
          value: contractAddress,
          type: "address",
        },
        { name: "audit_id", value: auditId, type: "string" },
        {
          name: "audit_response",
          value: auditArray.map(
            audit =>
              `function name: ${audit.functionName},audit result: ${audit.result}, audit explaination: ${audit.explanation}`,
          ),
          type: "string[]",
        },
        { name: "commit_id", value: "commit1", type: "string" },
      ]);

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: fetchedAccount!,
          expirationTime: BigInt(0),
          revocable: false, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });

      const newAttestationUID = await tx.wait();
      console.log("New attestation UID:", newAttestationUID);

      // const offchainAttestation = await offchain.signOffchainAttestation(
      //   {
      //     recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
      //     // Unix timestamp of when attestation expires. (0 for no expiration)
      //     expirationTime: BigInt(0),
      //     // Unix timestamp of current time
      //     time: BigInt(Math.floor(Date.now() / 1000)),
      //     revocable: true, // Be aware that if your schema is not revocable, this MUST be false

      //     nonce: BigInt(0),
      //     schema:
      //       "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
      //     refUID:
      //       "0x0000000000000000000000000000000000000000000000000000000000000000",
      //     data: encodedData,
      //   },
      //   ethersSigner
      // );

      // console.log(offchainAttestation, "offchainAttestation");
    } catch (error) {
      console.error(error);
      setReportLoading("error");
      setTimeout(() => {
        setReportLoading("idle");
      }, 2000);
    } finally {
      setReportLoading("idle");
    }
  }

  const generateAIReport = async () => {
    try {
      setReportLoading("ai");
      // if (id) {
      //   const data1: any = await publicClient.readContract({
      //     address: CONTRACT_ADDRESS,
      //     abi: auditMarketplaceAbi,
      //     functionName: "getContract",
      //     args: [parseInt(id as string)],
      //   });
      //   console.log(data1, "data in audit");
      //   if (data1 && (data1 as any)[5]) {
      //     const url = (data1 as any)[5] as string;
      //     const urlParts = data1[5].split("/");
      //     const repoOwner = urlParts[3];
      //     const repoName = urlParts[4];
      //     const branch = urlParts[6];
      //     const filePath = url.split(`/${branch}/`)[1];
      //     const data2 = await axios.post(`/api/generate-report`, {
      //       repoOwner,
      //       repoName,
      //       filePath,
      //       branch,
      //     });
      //     console.log(data2.data, "ai report");
      //     setAIReport(data2.data.data);
      //   }
      // }
    } catch (error: any) {
      console.error(error.message, "error in generateAIReport");
      setTimeout(() => {
        setReportLoading("idle");
      }, 2000);
      setReportLoading("error");
    }
  };

  console.log(ethersSigner, "ethersSigner from [] ");

  return (
    <div className="h-screen bg-background">
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add CI CD to this Contract</DialogTitle>
            <DialogDescription>
              <div className="mt-5">
                <code lang="yaml">
                  {`
                      name: Monitor File Changes

on:
  push:
    paths:
      - "contract/Test.sol"

jobs:
  check-file-changes:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Run custom script
        run: |
          echo "The file has changed!"
          cat contract/Test.sol 

          # Hit the backend URL
          curl -X POST https://my-express-app-f7i6.onrender.com/create-contract \
               -H "Content-Type: application/json" \
               -d '{"path": "contract/Test.sol"}'
                    `}
                </code>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Navbar />
      <main
        className="p-10 h-full w-full"
        style={{
          height: "calc(100vh - 20px)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          <Card>
            <CardHeader>
              <CardTitle>Audit Smart Contract</CardTitle>
              <CardDescription>
                Analyze your smart contract for potential vulnerabilities and optimization opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract-code">Contract Code</Label>
                  <Textarea
                    id="contract-code"
                    placeholder="Paste your Solidity code here..."
                    value={contractCode}
                    className="h-40"
                  />
                </div>
                <div>
                  <Label htmlFor="blockchain-network">Blockchain Network</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="polkadot">Polkadot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  {reportLoading === "idle" ? (
                    <Button
                      type="submit"
                      onClick={async () => {
                        if (ethersSigner) {
                          await generateAIReport();
                        }
                        if (aiReport && ethersSigner) {
                          await createAttestation(aiReport, CONTRACT_ADDRESS, id as string);
                        }
                      }}
                    >
                      Generate report
                    </Button>
                  ) : reportLoading === "ai" ? (
                    <Button type="submit" className="mt-4 " disabled>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Generating AI Report
                    </Button>
                  ) : reportLoading === "attestation" ? (
                    <Button type="submit" className="mt-4 " disabled>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Creating attestation
                    </Button>
                  ) : (
                    reportLoading === "error" && (
                      <Button type="submit" className="mt-4 " disabled>
                        Error
                      </Button>
                    )
                  )}
                  <Button onClick={() => setInfoOpen(prev => !prev)}>info</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className=" relative"
            style={{
              height: "calc(100vh - 100px)",
              overflowY: "auto",
            }}
          >
            <Tabs defaultValue="audit" className="w-full">
              <TabsList className="w-full sticky bg-white top-0 left-0 p-10">
                <TabsTrigger
                  value="audit"
                  className="w-full data-[state=active]:border data-[state=active]:shadow-none"
                >
                  Audit Report
                </TabsTrigger>
                <TabsTrigger value="tenderly" className="w-full">
                  Tenderly
                </TabsTrigger>
              </TabsList>
              <TabsContent value="audit">
                <CardHeader>
                  <CardTitle>Audit Report</CardTitle>
                  <CardDescription>Review the detailed analysis of your smart contract.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto">
                  {/* <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Vulnerabilities</h3>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <CircleAlert className="w-5 h-5 text-red-500 mt-1" />
                          <div>
                            <p className="font-medium">Reentrancy Vulnerability</p>
                            <p className="text-muted-foreground text-sm">
                              The contract is susceptible to reentrancy attacks. Recommend adding a mutex to prevent
                              multiple simultaneous calls.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CircleAlert className="w-5 h-5 text-red-500 mt-1" />
                          <div>
                            <p className="font-medium">Unprotected Ether Withdrawal</p>
                            <p className="text-muted-foreground text-sm">
                              The contract allows anyone to withdraw Ether, which could lead to loss of funds. Recommend
                              adding access control.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Gas Optimization</h3>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">Inefficient Storage Usage</p>
                            <p className="text-muted-foreground text-sm">
                              The contract stores data inefficiently, leading to higher gas costs. Recommend using more
                              compact data structures.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">Unnecessary Computations</p>
                            <p className="text-muted-foreground text-sm">
                              The contract performs unnecessary computations that can be optimized. Recommend caching
                              intermediate results.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Gas Optimization</h3>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">Inefficient Storage Usage</p>
                            <p className="text-muted-foreground text-sm">
                              The contract stores data inefficiently, leading to higher gas costs. Recommend using more
                              compact data structures.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">Unnecessary Computations</p>
                            <p className="text-muted-foreground text-sm">
                              The contract performs unnecessary computations that can be optimized. Recommend caching
                              intermediate results.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Other Findings</h3>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <InfoIcon className="w-5 h-5 text-blue-500 mt-1" />
                          <div>
                            <p className="font-medium">Lack of Natspec Documentation</p>
                            <p className="text-muted-foreground text-sm">
                              The contract lacks Natspec documentation, which can make it harder for developers to
                              understand and maintain the code.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div> */}

                  <div className="space-y-4">
                    {aiReport &&
                      aiReport.length > 0 &&
                      aiReport.map((report, index) => (
                        <div key={index} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-4">
                              <SquareFunction />

                              <h3 className="text-lg font-medium">
                                {report.functionName}
                                {`()`}
                              </h3>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                              <div
                                className={`w-5 h-5 ${report.result === "good" ? "text-green-500" : "text-red-500"
                                  } mt-1 flex items-center gap-2`}
                              >
                                <div
                                  className={`
                                  
                                     ${report.result === "good"
                                      ? "text-green-500"
                                      : report.result === "improvement"
                                        ? "text-yellow-500"
                                        : report.result === "security" && "text-red-500"
                                    }
                                  `}
                                >
                                  {report.result === "good" ? <Laugh /> : <CircleAlert />}
                                </div>
                                <p
                                  className={`
                                  
                                    ${report.result === "good"
                                      ? "text-green-500"
                                      : report.result === "improvement"
                                        ? "text-yellow-500"
                                        : report.result === "security" && "text-red-500"
                                    }
                                  `}
                                >
                                  {report.result === "good" ? "Good" : "Improvement"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm">{report.explanation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </TabsContent>
              <TabsContent value="tenderly">Tenderly</TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}

/**
 * 
 * [
  {
    functionName: 'getName',
    result: 'good',
    explanation: 'The function is a simple getter function that returns the address passed as an argument. It does not modify any state and is purely functional. There are no security issues or areas for improvement in this code.'
  },
  {
    functionName: 'setName',
    result: 'improvement',
    explanation: "The function lacks an event to log the name change, which can be beneficial for auditing and tracking purposes. It is recommended to add an event like `NameChanged(string newName)` to emit the new name when it's set."
  }
]
 */
