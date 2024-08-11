import hre from 'hardhat'


async function main() {
    // const [signer0] = await hre.ethers.getSigners()

    const contractFactory = await hre.ethers.getContractFactory("SimpleContract")
    const contract = await contractFactory.deploy()
    await contract.waitForDeployment()

    const addressDeployed = await contract.getAddress()


    await hre.tenderly.persistArtifacts({
        name: "SimpleContract",
        address: addressDeployed,
    })



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
