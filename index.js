const express = require("express");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

app.get("/deploy", (req, res) => {
    exec(
        `npx hardhat deploy --tags YourContract --network virtual_base`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send(`Stderr: ${stderr}`);
            }
            console.log(`Stdout: ${stdout}`);
            res.send(`Deployment output: ${stdout}`);
        }
    );
});


app.get("/runscript", (req, res) => {
    exec(
        `tenderly login --access-key ${process.env.TENDERLY_ACCESS_TOKEN} --authentication-method access-key`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send(`Error: ${error.message}`);
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send(`Stderr: ${stderr}`);
            }
            console.log(`Stdout: ${stdout}`);
            res.send(`Deployment output: ${stdout}`);
        }
    );
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});