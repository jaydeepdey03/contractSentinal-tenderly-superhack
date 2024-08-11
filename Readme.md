# ContractSentinel

ContractSentinel is a powerful tool designed to streamline CI/CD deployments of smart contracts to your preferred virtual testnets. By adding a simple GitHub Actions YAML file, you can set up automatic deployments with ease. The platform integrates with Tenderly to utilize virtual testnets and simulate transactions, providing a robust environment for smart contract development and testing.

The backend is hosted on Render and is built using Docker containers, ensuring a scalable and efficient deployment process. Additionally, ContractSentinel offers built-in contract auditing, highlighting security concerns and suggesting improvements where necessary.

## Key Features

- **CI/CD Smart Contract Deployment**: Automate the deployment of your smart contracts to virtual testnets by simply adding a GitHub Actions YAML file.
- **Tenderly Integration**: Utilize Tenderly's virtual testnets and transaction simulation features for comprehensive contract testing.
- **Automated Auditing**: Perform security audits on your contracts automatically, with detailed reports on potential vulnerabilities and improvement suggestions.
- **Backend Powered by Docker**: The platform's backend is hosted on Render and built using Docker containers for seamless scalability and reliability.

## Key Components of the project

### 1. Nodejs backend with Docker

We used a nodejs backend using Docker, as we required sudo permissions to install Tenderly CLI. It wouldn't be possible with normal Backend, as they don't give sudo/root user access. Using this we run tenderly and deploy users code which they already deployed on Github. Whenever they make any changes to the code, it automatically deploys to the respective virtual testnet

### 2. Frontend

Made using Nextjs, allows user to interact, build smart contracts with auditing and proper attestation using Ethereum Attestation Service.

### 3. Auditing AI

We also have an LLM model to find and help in code auditing, and suggestions

### 4. CI-CD

We are using Github actions to seemless integration and deployment experience

## Getting Started

#### 1. Configure GitHub Actions

Add a `.github/workflows/monitor-file.yml` file to your repository:

Sample yaml file used for deployment:
https://github.com/FidalMathew/check-ci-cd/blob/main/.github/workflows/monitor-file.yml

```yaml
name: Test Workflow

on:
  push:
    paths:
      - "**" # This matches any file in the repository

jobs:
  check-file-changes:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Run custom script
        run: |
          echo "The file has changed!"
          cat contract/TestName.sol 

          # Hit the backend URL
          curl -X POST https://my-express-app-f7i6.onrender.com/create-contract \
               -H "Content-Type: application/json" \
               -d '{"repoOwner": "FidalMathew","repoName": "check-ci-cd","branch": "main","filePath": "contract/TestName.sol","fileName": "TestName"}'

          echo "Contract created"
          curl -X POST https://my-express-app-f7i6.onrender.com/deploy \
               -H "Content-Type: application/json" \
               -d '{"contractName": "TestName", contractId: 1}'

          echo "Contract deployed"
```

This configuration will trigger the deployment process every time a change is pushed to a Solidity contract in the `contracts` directory.

#### 2. Simulate Transactions on Tenderly

After deploying your contract, you can simulate transactions directly on Tenderly’s dashboard. ContractSentinel will automatically handle the connection and provide detailed simulation results.

#### 3. Perform Security Audits

ContractSentinel performs automatic security audits during the deployment process. You can view the audit report in your CI/CD pipeline logs, or access detailed reports on the ContractSentinel dashboard.
