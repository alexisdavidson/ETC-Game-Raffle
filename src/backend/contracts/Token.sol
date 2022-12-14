// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(uint256 _initialSupply) ERC20("TestToken", "TK") {
        _mint(msg.sender, _initialSupply * 10**uint(decimals()));
    }
}
