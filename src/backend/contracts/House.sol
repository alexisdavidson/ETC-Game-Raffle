// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

contract House is Ownable, ReentrancyGuard {
    uint public rate = 100000;
    uint public feePercentWithdraw = 40; // 4.0%
    uint public feePercentDeposit = 5; // 0.5%
    address[] private gameContracts;
    address[] private admins;

    Token private token;

    modifier onlyAdmins() {
      require(isAdmin(msg.sender), "User is not admin");
      _;
    }

    constructor(address _newOwner, address[] memory _admins, address _tokenAddress) {
        transferOwnership(_newOwner);
        token = Token(_tokenAddress);

        delete admins;
        admins = _admins;
    }

    function playerBalance(address _playerAddress) public view returns(uint256) {
        return token.balanceOf(_playerAddress);
    }

    function buyTokens() public payable nonReentrant {
        require(msg.value >= 10000000000000000, "Minimum amount to deposit is 0.01");
        uint tokenAmount = msg.value * rate * (1000 - feePercentDeposit) / 1000;
        token.transfer(msg.sender, tokenAmount);
    }

    function sellTokens(uint _amount) public nonReentrant {
        uint etherAmount = _amount / rate * (1000 - feePercentWithdraw) / 1000;

        require(token.balanceOf(msg.sender) >= _amount, "User has not enough coins");
        require(address(this).balance >= etherAmount, "House has not enough liquidity");

        payable(msg.sender).transfer(etherAmount);
        token.transferFrom(msg.sender, address(this), _amount);
    }
    
    function withdraw() public onlyAdmins {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setGameContracts(address[] calldata _gameContracts) public onlyAdmins {
        delete gameContracts;
       gameContracts = _gameContracts;
    }

    function isGameContract(address _gameContract) public view returns (bool) {
        address[] memory _gameContracts = gameContracts;
        for (uint i = 0; i < _gameContracts.length; i++) {
            if (_gameContracts[i] == _gameContract) {
                return true;
            }
        }
        return false;
    }

    function addPlayerBalance(address _playerAddress, uint256 _amount) public {
        require(isGameContract(msg.sender), "Only game contracts can act on player balance");
        token.transfer(_playerAddress, _amount);
    }

    function substractPlayerBalance(address _playerAddress, uint256 _amount) public {
        require(isGameContract(msg.sender), "Only game contracts can act on player balance");
        token.transferFrom(_playerAddress, address(this), _amount);
    }
    
    function setAdmins(address[] calldata _admins) public onlyAdmins {
        delete admins;
        admins = _admins;
    }

    function isAdmin(address _user) public view returns (bool) {
        uint256 adminsLength = admins.length;
        for (uint256 i = 0; i < adminsLength;) {
            if (admins[i] == _user) {
                return true;
            }
            unchecked { ++i; }
        }
        return false;
    }
    
    function setFeePercentWithdraw(uint _fee) public onlyAdmins {
        feePercentWithdraw = _fee;
    }
    
    function setFeePercentDeposit(uint _fee) public onlyAdmins {
        feePercentDeposit = _fee;
    }
    
    function setRate(uint _rate) public onlyAdmins {
        rate = _rate;
    }

    function getFeePercentWithdraw() public view returns(uint) {
        return feePercentWithdraw;
    }

    function getFeePercentDeposit() public view returns(uint) {
        return feePercentDeposit;
    }

    function getRate() public view returns(uint) {
        return rate;
    }
}
