/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { tenderlyFund } from "../scripts/tenderly-fund";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  try {
    /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
    const { deployer } = await hre.getNamedAccounts();
    console.log("Deploying YourContract with the account:", deployer);
    const { deploy } = hre.deployments;

    await tenderlyFund(deployer);


    const contractFactory = await hre.ethers.getContractFactory("JaydeepContract")
    const contract = await contractFactory.deploy()
    await contract.waitForDeployment()

    // await deploy("YourContract", {
    //   from: deployer,
    //   args: [deployer],
    //   log: true,
    // });

    // // Get the deployed contract to interact with it after deploying.
    // const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
    // console.log("getvalue:", await yourContract.getValue());
  } catch (error) {
    console.error("Error deploying YourContract:", error);
  }

};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
