import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as tenderly from "@tenderly/hardhat-tenderly";
import dotenv from 'dotenv'


tenderly.setup({ automaticVerifications: true });
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "jaydeepSepolia",
  networks: {
    jaydeepSepolia: {
      url: "https://virtual.base-sepolia.rpc.tenderly.co/2b69961d-85ea-4ab5-b557-14db43935710",
      chainId: 845322,
      // currency: "VETH"
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  tenderly: {
    // https://docs.tenderly.co/account/projects/account-project-slug
    project: "jaydeepsepolia",
    username: "web3idiots",
  },
};

export default config;