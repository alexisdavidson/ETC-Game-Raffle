# Raffle (Hardhat-Solidity-React)
This app lets you connect your MetaMask wallet and play Raffle games

## Technology Stack
The smart contracts are developed using solidity.

The front-end part is developed using React.js.

The front-end communicates with the blockchain using ethers and Web3.

The tests are written supported by Waffle Hardhat and using chai assertion library.

## Dependencies
Install the dependencies with:
```
npm install
```

## Run the app
```
npm run start
```

## Deploy smart contracts
```
npx hardhat run src/backend/scripts/deploy.js --network localhost
```

## Run tests
```
npx hardhat test
```

## Connect MetaMask
Into metamask, click on the top network tab, scroll down and click custom RPC. The RPC url in our case is http://localhost:8545 and the chain ID is 31337.
