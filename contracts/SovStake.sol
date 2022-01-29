// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SovToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("SovToken", "SOV") {
        _mint(msg.sender, initialSupply);
    }
}

contract Voting is Ownable{
   constructor() public {
   }    
}