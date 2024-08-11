// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract AuditMarketplace {
	// Struct to store contract details
	struct ContractInfo {
		string contractName;
		address author;
		string contractCode;
		string description;
		string[] auditReport;
		uint256 timestamp;
		string githubLink;
		address[] contractsDeployed;
	}

	// Mapping from contract ID to ContractInfo
	mapping(uint256 => ContractInfo) public contracts;

	// Counter to generate unique contract IDs
	uint256 public contractId;

	// Event to notify when a new contract is added
	event ContractAdded(
		uint256 indexed contractId,
		address indexed author,
		uint256 timestamp
	);

	// Function to add a new contract to the marketplace
	function addContract(
		string memory _contractCode,
		string memory _githubLink,
		string memory _contractName
	) public // string[] memory _auditReport
	{
		contractId += 1;
		uint256 newContractId = contractId;

		string[] memory s;
		address[] memory a;

		contracts[newContractId] = ContractInfo({
			contractName: _contractName,
			author: msg.sender,
			contractCode: _contractCode,
			description: "",
			auditReport: s,
			timestamp: block.timestamp,
			githubLink: _githubLink,
			contractsDeployed: a
		});

		emit ContractAdded(newContractId, msg.sender, block.timestamp);
	}

	// Function to get contract details by ID
	function getContract(
		uint256 _contractId
	)
		public
		view
		returns (
			address,
			string memory,
			string memory,
			string[] memory,
			uint256,
			string memory
		)
	{
		ContractInfo memory contractInfo = contracts[_contractId];
		return (
			contractInfo.author,
			contractInfo.contractCode,
			contractInfo.description,
			contractInfo.auditReport,
			contractInfo.timestamp,
			contractInfo.githubLink
		);
	}

	// These two function will come from AI
	function updateAuditReportForAContract(
		uint256 _contractId,
		string memory _auditEntry
	) public {
		require(_contractId <= contractId, "Contract does not exist");
		require(
			msg.sender == contracts[_contractId].author,
			"Only the author can add audit reports"
		);

		contracts[_contractId].auditReport.push(_auditEntry);
	}

	function updateDescription(
		uint256 _contractId,
		string memory _description
	) public {
		require(_contractId <= contractId, "Contract does not exist");
		require(
			msg.sender == contracts[_contractId].author,
			"Only the author can add audit reports"
		);
		contracts[_contractId].description = _description;
	}

	function pushDeployedContract(
		uint256 _contractId,
		address _deployedAddress
	) public {
		require(_contractId <= contractId, "Contract does not exist");
		require(
			msg.sender == contracts[_contractId].author,
			"Only the author can push deployed contracts"
		);

		contracts[_contractId].contractsDeployed.push(_deployedAddress);
	}

	function getAllContracts() public view returns (ContractInfo[] memory) {
		ContractInfo[] memory allContracts = new ContractInfo[](contractId);

		for (uint256 i = 1; i <= contractId; i++) {
			allContracts[i - 1] = contracts[i];
		}

		return allContracts;
	}
}
