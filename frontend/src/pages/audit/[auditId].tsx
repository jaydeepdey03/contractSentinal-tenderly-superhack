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

const CONTRACT_ADDRESS = "0xE50bf3F5909f08998CD573e6361BC4C0902c9fFA";

export default function Audits() {
  const router = useRouter();
  const [infoOpen, setInfoOpen] = useState(false);

  const id = router.query.auditId;
  console.log(id, "id");
  const { fetchedAccount, walletClient } = useGlobalContextHook();
  const [contractAudits, setContractAudits] = useState<any>();
  const [contractCode, setContractCode] = useState<string>();

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: custom(window.ethereum!),
  });

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

  const generateAIReport = async () => {
    // try {
    //   if (id) {
    //     const data1: any = await publicClient.readContract({
    //       address: CONTRACT_ADDRESS,
    //       abi: auditMarketplaceAbi,
    //       functionName: "getContract",
    //       args: [parseInt(id as string)],
    //     });
    //     console.log(data1, "data in audit");
    //     if (data1 && (data1 as any)[5]) {
    //       const url = (data1 as any)[5] as string;
    //       const urlParts = data1[5].split("/");
    //       const repoOwner = urlParts[3];
    //       const repoName = urlParts[4];
    //       const branch = urlParts[6];
    //       const filePath = url.split(`/${branch}/`)[1];
    //       const data2 = await axios.post(`/api/generate-report`, {
    //         repoOwner,
    //         repoName,
    //         filePath,
    //         branch,
    //       });
    //       console.log(data2.data, "ai report");
    //       setAIReport(data2.data.data);
    //     }
    //   }
    // } catch (error: any) {
    //   console.error(error.message, "error in generateAIReport");
    // }
  };

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
                  <Button type="submit" onClick={generateAIReport}>
                    Generate report
                  </Button>
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
                                className={`w-5 h-5 ${
                                  report.result === "good" ? "text-green-500" : "text-red-500"
                                } mt-1 flex items-center gap-2`}
                              >
                                <div
                                  className={`
                                  
                                     ${
                                       report.result === "good"
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
                                  
                                    ${
                                      report.result === "good"
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
