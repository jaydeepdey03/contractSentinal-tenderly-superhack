import hre from 'hardhat'
import { tenderlyFund } from "../scripts/tenderly-fund";

const contractName = process.env.CONTRACT_NAME
async function main() {
    try {
        const { deployer } = await hre.getNamedAccounts();

        await tenderlyFund(deployer);

        const contractFactory = await hre.ethers.getContractFactory(contractName!)
        const contract = await contractFactory.deploy()
        await contract.waitForDeployment()

    } catch (error: any) {
        console.log('error: ', error.message)
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });