const keccak256 = require("keccak256")
const buf2hex = x => '0x' + x.toString('hex')

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  let entryPrice = 50_000_000;
  let firstRandomNumber = 23423678
  let provenance = buf2hex(keccak256(parseInt(firstRandomNumber)))
  let teamWallet = deployer.address
  teamWallet = "0x4BF855cDABaCe4700b41fA713c57da0d07D9a15C"
  console.log("provenance: " + provenance)
  // console.log(toWei(entryPrice))
  // return

  // const TokenTest = await ethers.getContractFactory("Token");
  // const tokenTest = await TokenTest.deploy(10_000_000_000);
  // console.log("TokenTest contract address", tokenTest.address)
  // saveFrontendFiles(tokenTest, "Token");

  const Raffle = await ethers.getContractFactory("Raffle");
  const apeTokenAddress = "0xdA616532A458bC5B965B89D7d4cb50C7B9E30347"
  const raffle = await Raffle.deploy(apeTokenAddress, toWei(entryPrice), teamWallet, provenance);
  
  console.log("Raffle contract address", raffle.address)
  saveFrontendFiles(raffle, "Raffle");
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
