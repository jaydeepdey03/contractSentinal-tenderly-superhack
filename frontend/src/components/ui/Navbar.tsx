import useGlobalContextHook from "@/context/useGlobalContextHook";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useRouter} from "next/router";
import {Dispatch, SetStateAction} from "react";

export default function Navbar({
  setOpen,
}: {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) {
  const {fetchedAccount, connectWallet} = useGlobalContextHook();
  const router = useRouter();
  return (
    <nav className="border-b h-[80px] w-full">
      <div className="h-full w-full flex items-center justify-between p-5">
        <div className="flex items-center">
          {/* <Image
    src="/logo.svg"
    alt="Logo"
    width={40}
    height={40}
    layout="fixed"
  /> */}
          <h1 className="ml-2 text-xl font-bold">ChainSentinal</h1>
        </div>
        <div className="flex items-center gap-3">
          {fetchedAccount ? (
            <>
              {fetchedAccount.toString().slice(0, 6) +
                "..." +
                fetchedAccount.toString().slice(-4)}
            </>
          ) : (
            <p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </p>
          )}

          {setOpen && (
            <Button
              className="border-2 rounded-full"
              variant={"outline"}
              // size={"icon"}
              onClick={() => setOpen((prev) => !prev)}
            >
              <Plus className="h-5 w-5" />
              <span className="ml-1">Create a new Contract Audit</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
