require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@ericxstone/hardhat-blockscout-verify");
require("dotenv").config();
const { REACT_APP_API_URL, REACT_APP_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.4",
  networks: {
     hardhat: {},
     goerli: {
       url: process.env.REACT_APP_API_URL_GOERLI_INFURA,
       accounts: ['0x' + process.env.REACT_APP_PRIVATE_KEY_GOERLI]
     },
     etc: {
       url: process.env.REACT_APP_API_URL_ETC,
       accounts: ['0x' + process.env.REACT_APP_PRIVATE_KEY_ETC]
     },
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY,
    // apiKey: process.env.REACT_APP_POLYGONSCAN_API_KEY
    customChains: [
      {
        network: "etc",
        chainId: 61,
        urls: {
          apiURL: "https://blockscout.com/etc/mainnet/api",
          browserURL: "https://blockscout.com/etc/mainnet/"
        }
      }
    ]
  },
  // blockscoutVerify: {
  //   blockscoutURL: "<BLOCKSCOUT_EXPLORER_URL>",
  //   contracts: {
  //     "<CONTRACT_NAME>": {
  //       compilerVersion: SOLIDITY_VERSION.<CONTRACT_COMPILER_VERSION>, // checkout enum SOLIDITY_VERSION
  //       optimization: true,
  //       evmVersion: EVM_VERSION.<EVM_VERSION>, // checkout enum SOLIDITY_VERSION
  //       optimizationRuns: 999999,
  //     }
  //   }
  // }
};
