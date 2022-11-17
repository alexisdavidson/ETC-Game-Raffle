// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTest is ERC20 {
    constructor() ERC20("Test ETC Token", "TET") {
        _mint(msg.sender, 42 * 10**uint(decimals()));
    }
}