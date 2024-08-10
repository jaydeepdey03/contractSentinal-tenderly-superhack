type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  virtual_base: {
    url: "https://virtual.base-sepolia.rpc.tenderly.co/2b69961d-85ea-4ab5-b557-14db43935710",
    chainId: 845322,
    currency: "VETH",
  },
};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
