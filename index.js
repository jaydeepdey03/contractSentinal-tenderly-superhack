/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable prettier/prettier */
const express = require("express");
const { exec } = require("child_process");
const app = express();
const PORT = process.env.PORT || 8000;
<<<<<<< Updated upstream
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
=======
const fs = require('fs');
const path = require('path');
const axios = require('axios')
const cors = require('cors')
>>>>>>> Stashed changes
app.use(express.json());
require("dotenv").config();
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
app.use(cors());

const apiKey = process.env.GEMINI_API_KEY;
console.log(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};
const chatSession = model.startChat({
  generationConfig,
});

app.post("/deploy", (req, res) => {
<<<<<<< Updated upstream
  const { contractName } = req.body;
=======
    const { contractName } = req.body;

    try {
        exec(
            `CONTRACT_NAME=${contractName} npx hardhat run contractDeploy/deploy.ts --network virtual_base`,
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
>>>>>>> Stashed changes

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
      },
    );
  } catch (err) {
    console.log("error: ", err.message);
  }
});

app.get("/runscript", (req, res) => {
<<<<<<< Updated upstream
  try {
    exec(
      `tenderly login --access-key ${process.env.TENDERLY_ACCESS_TOKEN} --authentication-method access-key`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return res.status(500).send(`Error: ${error.message}`);
=======
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
app.post('/create-contract', async (req, res) => {

    const { fileName, repoOwner, repoName, filePath, branch } = req.body;
    try {

        if (!fileName) {
            return res.status(400).send("No fileName mentioned")
>>>>>>> Stashed changes
        }
        if (stderr) {
          console.error(`logs: ${stderr}`);
          return res.status(500).send(`Stderr: ${stderr}`);
        }
<<<<<<< Updated upstream
        console.log(`Stdout: ${stdout}`);
        res.send(`Deployment output: ${stdout}`);
      },
    );
  } catch (err) {
    console.log("error: ", err.message);
  }
=======

        // Define the contracts directory
        const contractsDir = path.join(__dirname, 'contracts');

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true });
        }

        // Write the Solidity code to the file
        const filePath1 = path.join(contractsDir, `${fileName}.sol`);
        fs.writeFileSync(filePath1, solidityCode, 'utf8');

        res.status(201).send(`File ${fileName}.sol has been created in ${contractsDir}`);
    } catch (err) {
        console.log('error: ', err.message)
        res.status(500).json({
            error: err.message
        });
    }


>>>>>>> Stashed changes
});

// POST route to create a Solidity file
app.post("/create-contract", async (req, res) => {
  const { fileName, repoOwner, repoName, filePath, branch } = req.body;

  try {
    if (!fileName) {
      return res.status(400).send("No fileName mentioned");
    }

    let solidityCode = await getContractContent(repoOwner, repoName, filePath, branch);

    if (!solidityCode) {
      return res.status(400).send("Unable to fetch Solidity code");
    }

    // Define the contracts directory
    const contractsDir = path.join(__dirname, "contracts");

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Write the Solidity code to the file
    const filePath = path.join(contractsDir, `${fileName}.sol`);
    fs.writeFileSync(filePath, solidityCode, "utf8");

    res.status(201).send(`File ${fileName}.sol has been created in ${contractsDir}`);
  } catch (err) {
    console.log("error: ", err.message);
  }
});

// Function to fetch the content of a contract file from a GitHub repository

app.post("/get-contract", async (req, res) => {
  const { repoOwner, repoName, filePath, branch } = req.body;

  try {
    const contractContent = await getContractContent(repoOwner, repoName, filePath, branch);

    if (!contractContent) {
      return res.status(400).send("Unable to fetch Solidity code");
    }

    res.status(200).send(contractContent);
  } catch (err) {
    console.log("error: ", err.message);
  }
});

const getContractContent = async (repoOwner, repoName, filePath, branch) => {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
  const token = process.env.GITHUB_ACCESS_TOKEN;

  // Define headers with the GitHub token
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // Fetch file content from GitHub
    const response = await axios.get(apiUrl, { headers });

    // Decode the base64 content
    const currentContent = Buffer.from(response.data.content, "base64").toString("utf-8");

    console.log(currentContent, filePath, response.data.sha);

    return currentContent;
  } catch (error) {
    console.error("Error retrieving file content:", error);
  }
};

// getContractContent()
// https://github.com/jaydeepdey03/jaydeep-test-alchemy-superhack/blob/main/src/styles/globals.css
// getContractContent(
//   "jaydeepdey03",
//   "jaydeep-test-alchemy-superhack",
//   "src/styles/globals.css",
//   "main"
// );
const extractFunctions = solidityCode => {
  console.log(solidityCode, "extract functions");

  // Split the code by the keyword 'function'
  const parts = solidityCode.split("function");

  // Filter out and re-add the 'function' keyword to valid function blocks
  const functions = parts
    .slice(1) // Skip the first part since it will be before the first 'function' keyword
    .map(part => "function" + part.split("}")[0] + "}");

  // Print the matched functions
  functions.forEach((func, index) => {
    console.log(`Function ${index + 1}:\n${func}\n`);
  });
  //   const functionRegex = /function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{[^}]*\}/g;

  //   const res = solidityCode.match(functionRegex);
  //   console.log(res, "extract functions");

  //   return solidityCode.match(functionRegex);

  return functions;
};

app.post("/generate-report", async (req, res) => {
  const { repoOwner, repoName, filePath, branch } = req.body;

  console.log(repoOwner, repoName, filePath, branch);
  try {
    const contractContent = await getContractContent(repoOwner, repoName, filePath, branch);

    console.log(contractContent);

    if (!contractContent) {
      return res.status(400).send("Unable to fetch Solidity code");
    }

    const functions = extractFunctions(contractContent);

    console.log(functions);

    let report = "";

    for (let index = 0; index < functions.length; index++) {
      const code = functions[index];

      const result = await chatSession.sendMessage(` ${code}
                  In the above code,
                  If security issues persist, return json (
                  {
                  functionName: ....,
                  result: 'security',
                  explanation: ....,
                  })

                  if improvement are required such as adding Events, etc,
                  return json
                  ({
                  functionName: ....,
                  result: 'improvement',
                  explanation: ....,
                  })
                  if no issues persist, return json
                  ({
                  functionName: ....,
                  result: 'good',
                  explanation: ....})

                  `);

      //   console.log(result.response.text());

      if (index != 0) report += "," + result.response.text();
      else report += result.response.text();
    }

    report = "[" + report + "]";

    console.log(report);

    const resReport = JSON.parse(report);

    res.json(resReport).status(200);
  } catch (err) {
    console.log("error: ", err.message);
    res.status(500).send(err);
  }

  //   res.send("dsa").status(200);
});

app.post("/get-code", async (req, res) => {
  try {
    const { code, description } = req;

    const result = await chatSession.sendMessage(` ${code} 
                In the above code, 
                description of the error or improvement required: ${description} 
                Send the fixed code as json response


                {
                "code": ...
                }

        `);

    res.json(result).status(200);
  } catch (error) {
    res.send(error.message).status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
