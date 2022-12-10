// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Raffle is Ownable, ReentrancyGuard {
    ERC20 private token; // Apecoin Classic ETC, ACE 0xdA616532A458bC5B965B89D7d4cb50C7B9E30347

    address[11] public participants;
    uint256 public entryPrice;
    uint256 public totalBurned;
    uint256 public totalPayout;
    address public lastWinner;
    uint256 public participantsCount;

    uint256 private percentToBurn = 30;
    uint256 private percentToTeam = 70;
    address private teamWallet;

    // Server generates random number, then compute sha256(number) and saves it here publicly
    // When the number is reavealed (after the game ends), users can verify the correctness of this provenance 
    // by computing sha256(number) themselves
    uint256 public lastRandomNumber;
    string public lastProvenance;
    string public nextProvenance;
    
    event SlotEntered(address user, uint256 slot);
    event SlotLeft(address user, uint256 slot);
    event RaffleFilled();
    event RaffleEnded();

    constructor(address _tokenAddress, uint256 _entryPrice, address _teamWallet, string memory _provenance) {
        entryPrice = _entryPrice;
        token = ERC20(_tokenAddress);
        teamWallet = _teamWallet;
        nextProvenance = _provenance;
    }

    function play(uint256 _slot) public nonReentrant {
        require(_slot < 11, "Can only enter a slot from 0 to 10");
        require(participants[_slot] == address(0), "This slot is not free");
        
        // Pay tokens
        token.transferFrom(msg.sender, address(this), entryPrice);

        participants[_slot] = msg.sender;
        participantsCount += 1;

        emit SlotEntered(msg.sender, _slot);

        if (participantsCount >= 11) {
            emit RaffleFilled(); // Frontend listen to this event and call API to draw winner
        }
    }

    function pullOut(uint256 _slot) public nonReentrant {
        require(_slot < 11, "Can only leave a slot from 0 to 11");
        require(participants[_slot] == msg.sender, "This slot was not taken by you");
    
        participants[_slot] = address(0);
        participantsCount -= 1;

        token.transfer(msg.sender, entryPrice);

        emit SlotLeft(msg.sender, _slot);
    }

    // This function is called from our centralized server which will provide a random number
    // The authenticity of the random number can be verified through provenance hash
    function endRaffle(uint256 _randomNumber, string memory _provenance) public onlyOwner {
        require(participantsCount >= 11, "Not enough users participated");
        
        lastProvenance = nextProvenance;
        nextProvenance = _provenance;
        lastRandomNumber = _randomNumber;
        uint256 _winnerIndex = _randomNumber % 11;

        lastWinner = participants[_winnerIndex];
        // Give 10x entries to winner
        token.transfer(lastWinner, entryPrice * 10);

        // 11th entry will go to
        uint256 _amountToBurn = (entryPrice * percentToBurn) / 100;
        uint256 _amountToTeam = (entryPrice * percentToTeam) / 100;
        
        token.transfer(address(0x000000000000000000000000000000000000dEaD), _amountToBurn);
        token.transfer(teamWallet, _amountToTeam);

        totalBurned += _amountToBurn;
        totalPayout += entryPrice * 10;

        // Clear participants list address(0)
        for (uint256 i = 0; i < 11;) {
            participants[i] = address(0);
            unchecked { ++i; }
        }
        participantsCount = 0;
        
        emit RaffleEnded();
    }

    function setPercentToBurn(uint256 _percent) public onlyOwner {
        percentToBurn = _percent;
    }

    function setPercentToTeam(uint256 _percent) public onlyOwner {
        percentToTeam = _percent;
    }

    function setEntryPrice(uint256 _entryPrice) public onlyOwner {
        entryPrice = _entryPrice;
    }

    function getParticipants() public view returns(address[11] memory){
        return participants;
    }
    
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
