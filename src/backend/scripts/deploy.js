const keccak256 = require("keccak256")
const buf2hex = x => '0x' + x.toString('hex')

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  let entryPrice = 20_000_000;
  let firstRandomNumber = 23423678
  let provenance = buf2hex(keccak256(firstRandomNumber))
  // console.log(provenance)
  // console.log(toWei(entryPrice))
  // return

  const TokenTest = await ethers.getContractFactory("Token");
  const Raffle = await ethers.getContractFactory("Raffle");
  const tokenTest = await TokenTest.deploy(10_000_000_000);
  const raffle = await Raffle.deploy(tokenTest.address, toWei(entryPrice), deployer.address, provenance);
  
  console.log("Raffle contract address", raffle.address)
  saveFrontendFiles(raffle, "Raffle");

  console.log("TokenTest contract address", tokenTest.address)
  saveFrontendFiles(tokenTest, "Token");
  return

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  console.log("Token contract address", token.address)

  const House = await ethers.getContractFactory("House");
   //newOwner, admins, tokenAddress
  // client's goerli wallet: 0xe2a183EC51E30757DF6C12F43262e6D956B95561
  // const house = await House.deploy("0xCaC8c3f44f913b012D304d36E94BA124B1Ca8A9B", // mumbai
  //   ["0xCaC8c3f44f913b012D304d36E94BA124B1Ca8A9B", "0xCaC8c3f44f913b012D304d36E94BA124B1Ca8A9B"], token.address);
  const house = await House.deploy("0xe2a183EC51E30757DF6C12F43262e6D956B95561", // goerli
    ["0xe2a183EC51E30757DF6C12F43262e6D956B95561", "0xD71E736a7eF7a9564528D41c5c656c46c18a2AEd"], token.address);
    // const house = await House.deploy("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // localhost
    //   ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"], token.address);
  console.log("House contract address", house.address)

  const CoinFlip = await ethers.getContractFactory("CoinFlip");
  const coinflip = await CoinFlip.deploy(house.address, 765); // goerli
  // const coinflip = await CoinFlip.deploy(house.address, 1739); // mumbai
  console.log("CoinFlip contract address", coinflip.address)

  await house.setGameContracts([coinflip.address]);
  await token.claimInitialSupply(house.address);
  console.log("Functions called")
  
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(token, "Token");
  saveFrontendFiles(house, "House");
  saveFrontendFiles(coinflip, "CoinFlip");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
