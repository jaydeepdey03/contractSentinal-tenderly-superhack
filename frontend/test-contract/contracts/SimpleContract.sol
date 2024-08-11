// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract SimpleContract {
    uint256 public value;
    event ValuesSet(uint256 indexed value, string indexed message);
    event ValueIncrementd(uint256 indexed value, string indexed message);

    function setValue(uint256 _value) public {
        value = _value;
        emit ValuesSet(_value, "Value set");
    }

    function increment() public {
        value += 1;
        emit ValueIncrementd(value, "Value incremented");
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
