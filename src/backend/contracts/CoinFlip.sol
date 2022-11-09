// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./House.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract CoinFlip is Ownable, ReentrancyGuard, VRFConsumerBaseV2 {
    House private house;
    
    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    address vrfCoordinator = 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D; // goerli
    // address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed; // mumbai
    bytes32 keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15; // goerli
    // bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f; // mumbai
    uint32 callbackGasLimit = 200000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;
    uint256[] public s_randomWords;
    uint256 public s_requestId;

    uint256 private betId;

    struct Bet {
        address user;
        uint256 amount;
        uint256 betId;
    }

    Bet[] betsQueue;

    event BetStarted(
        address user,
        uint256 amount,
        uint256 betId
    );

    event BetSettled(
        address user,
        uint256 amount,
        uint256 result,
        uint256 betId
    );

    constructor(address _houseAddress, uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        house = House(_houseAddress);

        // Initialize Chainlink Coordinator
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function play(uint _betAmount) public {
        require(house.playerBalance(msg.sender) >= _betAmount, "Not enough coins to bet");
        betId = betId + 1;

        // Request random number from Chainlink and add bet to queue
        requestFlip();
        betsQueue.push(Bet(msg.sender, _betAmount, betId));
        
        emit BetStarted(msg.sender, _betAmount, betId);
    }

    // Request random number from Chainlink
    function requestFlip() public {
        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    // Callback function when random number from Chainlink is generated
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
        
        uint256 betsQueueLength = betsQueue.length;
        require(betsQueueLength > 0, "No bets in queue");

        // Here we take the last bet in queue and handle it
        Bet memory lastBet = betsQueue[betsQueueLength - 1];
        bool result = s_randomWords[0] % 2 == 1;
        // The player has a 50% chance to receive the amount bet in tokens or to lose them
        if (result) {
            house.addPlayerBalance(lastBet.user, lastBet.amount);
        } else {
            house.substractPlayerBalance(lastBet.user, lastBet.amount);
        }

        emit BetSettled(lastBet.user, lastBet.amount, s_randomWords[0] % 2, lastBet.betId);
        betsQueue.pop(); // Remove last bet from queue
    }
}
