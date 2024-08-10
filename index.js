const express = require("express");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

app.use(express.json());
require("dotenv").config();

app.post("/deploy", (req, res) => {
    const { contractName } = req.body;

    try {
        exec(
            `CONTRACT_NAME=${contractName} npx hardhat run contractDeploy/deploy.ts --network virtual_base `,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return res.status(500).send(`Error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`logs: ${stderr}`);
                    return res.status(200).send(`logs: ${stderr}`);
                }
                console.log(`Stdout: ${stdout}`);
                res.send(`Deployment output: ${stdout}`);
            }
        );
    } catch (err) {
        console.log('error: ', err.message);
    }

});


app.get("/runscript", (req, res) => {
    try {

        exec(
            `tenderly login --access-key ${process.env.TENDERLY_ACCESS_TOKEN} --authentication-method access-key`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return res.status(500).send(`Error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`logs: ${stderr}`);
                    return res.status(500).send(`Stderr: ${stderr}`);
                }
                console.log(`Stdout: ${stdout}`);
                res.send(`Deployment output: ${stdout}`);
            }
        );
    } catch (err) {
        console.log('error: ', err.message);
    }
})

// POST route to create a Solidity file
app.post('/create-contract', (req, res) => {
    const { fileName, solidityCode } = req.body;

    try {
        if (!fileName || !solidityCode) {
            return res.status(400).send('fileName and solidityCode are required.');
        }

        // Define the contracts directory
        const contractsDir = path.join(__dirname, 'contracts');

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true });
        }

        // Write the Solidity code to the file
        const filePath = path.join(contractsDir, `${fileName}.sol`);
        fs.writeFileSync(filePath, solidityCode, 'utf8');

        res.status(201).send(`File ${fileName}.sol has been created in ${contractsDir}`);
    } catch (err) {
        console.log('error: ', err.message)
    }


});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});