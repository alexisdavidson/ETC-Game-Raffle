// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    bool public initialSupplyClaimed;

    constructor() ERC20("Cravati", "CRV") { }

    function claimInitialSupply(address _stakerAddress) external {
        require(initialSupplyClaimed == false, 'Initial supply has already been claimed');
        initialSupplyClaimed = true;
        
        // Mint 222'000'000 tokens
        _mint(_stakerAddress, 222000000 * 10**uint(decimals()));
        approveUnlimited(_stakerAddress);
    }

    function approveUnlimited(address _spender) public {
        approve(_spender, 2**256 - 1);
    }
}
