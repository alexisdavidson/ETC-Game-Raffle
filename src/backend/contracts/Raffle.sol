// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Raffle is Ownable, ReentrancyGuard {
    ERC20 token; // Apecoin Classic ETC, ACE 0xdA616532A458bC5B965B89D7d4cb50C7B9E30347

    address teamWallet;
    address[11] participants;
    uint256 poolPrize;
    bool ended;
    uint256 totalBurned;
    uint256 totalPayout;
    address lastWinner;
    uint256 participantsCount;

    uint256 percentToBurn = 30;
    uint256 percentToTeam = 70;
    
    event SlotEntered(address user, uint256 slot);
    event SlotLeft(address user, uint256 slot);
    event RaffleFilled();

    constructor(address _tokenAddress, uint256 _poolPrize, address _teamWallet) {
        poolPrize = _poolPrize;
        token = ERC20(_tokenAddress);
        teamWallet = _teamWallet;
    }

    function play(uint256 _slot) public payable nonReentrant {
        require(_slot < 11, "Can only enter a slot from 0 to 11");
        require(participants[_slot] == address(0), "This slot is not free");
        require(msg.value >= amountToParticipate(), "Not enough ETC sent");

        participants[_slot] = msg.sender;
        participantsCount += 1;

        emit SlotEntered(msg.sender, _slot);

        if (participantsCount >= 11) {
            // Todo: Draw winner
            emit RaffleFilled();
        }
    }

    function pullOut(uint256 _slot) public nonReentrant {
        require(_slot < 11, "Can only leave a slot from 0 to 11");
        require(participants[_slot] == msg.sender, "This slot was not taken by you");
    
        participants[_slot] = address(0);
        participantsCount -= 1;

        token.transfer(msg.sender, amountToParticipate());

        emit SlotLeft(msg.sender, _slot);
    }

    // This function is called from our centralized server 
    // which will provide a random number
    // The authenticity of the random number can be verified
    // through provenance hash
    function endRaffle(uint256 _winnerIndex) public onlyOwner {
        ended = true;

        lastWinner = participants[_winnerIndex];
        // Give 10x entries to winner
        token.transfer(msg.sender, poolPrize);

        // 11th entry will go to
        uint256 _amountToBurn = amountToParticipate() * percentToBurn / 100;
        uint256 _amountToTeam = amountToParticipate() * percentToTeam / 100;
        
        token.transfer(address(0x000000000000000000000000000000000000dEaD), _amountToBurn);
        token.transfer(teamWallet, _amountToTeam);

        totalBurned += _amountToBurn;
        totalPayout += poolPrize;

        // Clear participants list address(0)
        for (uint256 i = 0; i < 11;) {
            participants[i] = address(0);
            unchecked { ++i; }
        }
        participantsCount = 0;
    }

    function setPercentToBurn(uint256 _percent) public onlyOwner {
        percentToBurn = _percent;
    }

    function setPercentToTeam(uint256 _percent) public onlyOwner {
        percentToTeam = _percent;
    }

    function setPoolPrize(uint256 _poolPrize) public onlyOwner {
        poolPrize = _poolPrize;
    }

    function amountToParticipate() public view returns(uint256) {
        return poolPrize / 10;
    }
    
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
