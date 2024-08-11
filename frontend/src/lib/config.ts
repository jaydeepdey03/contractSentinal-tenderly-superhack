import { createPublicClient, createWalletClient, custom, defineChain, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";

export const jaydeepSepolia = defineChain({
    id: 56879,
    name: 'Virtual Base Sepolia',
    nativeCurrency: { name: 'VETH', symbol: 'vETH', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL!] }
    },
    blockExplorers: {
        default: {
            name: 'Tenderly Explorer',
            url: 'https://virtual.base-sepolia.rpc.tenderly.co/97364b88-a8e4-42ba-9999-e9da694c42a5'
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



