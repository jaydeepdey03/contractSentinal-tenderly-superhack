// https://base-sepolia.easscan.org/schema/view/0xe42802fb8300245889f7fc7ade0a4240223b5a5a8dfe6d0976a75accce17e556
// 0x145a7774aa7060D983309315cb77c0c4DCe0fF58
import {Button} from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {CircleAlert, InfoIcon, Plus, SlidersVerticalIcon} from "lucide-react";
import {useRouter} from "next/router";
import {EAS, SchemaEncoder} from "@ethereum-attestation-service/eas-sdk";
import {usePrivy, useWallets} from "@privy-io/react-auth";
import {useEffect, useState} from "react";
import {createWalletClient, custom, EIP1193Provider, Hex} from "viem";
import {baseSepolia} from "viem/chains";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ethers} from "ethers";
import Navbar from "@/components/ui/Navbar";
import useGlobalContextHook from "@/context/useGlobalContextHook";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID =
  "0xe42802fb8300245889f7fc7ade0a4240223b5a5a8dfe6d0976a75accce17e556";

const eas = new EAS(easContractAddress);

export default function Create() {
  const router = useRouter();
  const {ethersSigner} = useGlobalContextHook();

  async function createAttestation() {
    try {
      if (!ethersSigner) {
        console.log("No signer found");
        return;
      }
      await eas.connect(ethersSigner);
      const offchain = await eas.getOffchain();

      const schemaEncoder = new SchemaEncoder(
        "address contract_address,string audit_id,string[] audit_response,string commit_id"
      );

      // Cannot read properties of null (reading 'schema')
      const encodedData = schemaEncoder.encodeData([
        {
          name: "contract_address",
          value: "0x145a7774aa7060D983309315cb77c0c4DCe0fF58",
          type: "address",
        },
        {name: "audit_id", value: "helloworld1", type: "string"},
        {
          name: "audit_response",
          value: [
            "The contract is susceptible to reentrancy attacks. Recommend adding a mutex to prevent multiple simultaneous calls.",
            "The contract allows anyone to withdraw Ether, which could lead to loss of funds. Recommend adding access control.",
            "The contract stores data inefficiently, leading to higher gas costs. Recommend using more compact data structures.",
            "The contract performs unnecessary computations that can be optimized. Recommend caching intermediate results.",
            "The contract stores data inefficiently, leading to higher gas costs. Recommend using more compact data structures.",
            "The contract performs unnecessary computations that can be optimized. Recommend caching intermediate results.",
            "The contract lacks Natspec documentation, which can make it harder for developers to understand and maintain the code.",
          ],
          type: "string[]",
        },
        {name: "commit_id", value: "commit1", type: "string"},
      ]);

      // const tx = await eas.attest({
      //   schema: schemaUID,
      //   data: {
      //     recipient: "0x3f93B8DCAf29D8B3202347018E23F76e697D8539",
      //     expirationTime: BigInt(0),
      //     revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      //     data: encodedData,
      //   },
      // });

      // const newAttestationUID = await tx.wait();
      // console.log("New attestation UID:", newAttestationUID);

      const offchainAttestation = await offchain.signOffchainAttestation(
        {
          recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
          // Unix timestamp of when attestation expires. (0 for no expiration)
          expirationTime: BigInt(0),
          // Unix timestamp of current time
          time: BigInt(Math.floor(Date.now() / 1000)),
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false

          nonce: BigInt(0),
          schema:
            "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
          refUID:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          data: encodedData,
        },
        ethersSigner
      );

      console.log(offchainAttestation, "offchainAttestation");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="h-screen bg-background">
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
                Analyze your smart contract for potential vulnerabilities and
                optimization opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract-code">Contract Code</Label>
                  <Textarea
                    id="contract-code"
                    placeholder="Paste your Solidity code here..."
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
                  <Button type="submit">Audit Contract</Button>
                  <Button onClick={createAttestation}>EAS</Button>
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
                  <CardDescription>
                    Review the detailed analysis of your smart contract.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Vulnerabilities</h3>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <CircleAlert className="w-5 h-5 text-red-500 mt-1" />
                          <div>
                            <p className="font-medium">
                              Reentrancy Vulnerability
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract is susceptible to reentrancy attacks.
                              Recommend adding a mutex to prevent multiple
                              simultaneous calls.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CircleAlert className="w-5 h-5 text-red-500 mt-1" />
                          <div>
                            <p className="font-medium">
                              Unprotected Ether Withdrawal
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract allows anyone to withdraw Ether,
                              which could lead to loss of funds. Recommend
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
                            <p className="font-medium">
                              Inefficient Storage Usage
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract stores data inefficiently, leading to
                              higher gas costs. Recommend using more compact
                              data structures.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">
                              Unnecessary Computations
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract performs unnecessary computations
                              that can be optimized. Recommend caching
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
                            <p className="font-medium">
                              Inefficient Storage Usage
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract stores data inefficiently, leading to
                              higher gas costs. Recommend using more compact
                              data structures.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <SlidersVerticalIcon className="w-5 h-5 text-yellow-500 mt-1" />
                          <div>
                            <p className="font-medium">
                              Unnecessary Computations
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract performs unnecessary computations
                              that can be optimized. Recommend caching
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
                            <p className="font-medium">
                              Lack of Natspec Documentation
                            </p>
                            <p className="text-muted-foreground text-sm">
                              The contract lacks Natspec documentation, which
                              can make it harder for developers to understand
                              and maintain the code.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
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
