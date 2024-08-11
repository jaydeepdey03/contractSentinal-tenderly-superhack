import { createPublicClient, createWalletClient, custom, defineChain, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export const jaydeepSepolia = defineChain({
    id: 845322,
    name: 'Virtual Base Sepolia',
    nativeCurrency: { name: 'VETH', symbol: 'vETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://virtual.base-sepolia.rpc.tenderly.co/2b69961d-85ea-4ab5-b557-14db43935710'] }
    },
    blockExplorers: {
        default: {
            name: 'Tenderly Explorer',
            url: 'https://virtual.base-sepolia.rpc.tenderly.co/f0616751-2a07-4968-8eaa-e404b5748100'
        }
    },
});


export const jaydeepSepoliaPublicClient = createPublicClient({
    chain: jaydeepSepolia,
    transport: http(jaydeepSepolia.rpcUrls.default.http[0]),
})


export const jaydeepSepoliaWalletClient = createWalletClient({
    chain: jaydeepSepolia,
    transport: http(jaydeepSepolia.rpcUrls.default.http[0]),
})



const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!


export const account = privateKeyToAccount(`0x${privateKey}`)
