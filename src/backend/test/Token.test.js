const { expect } = require("chai")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("Token", async function() {
    let deployer, addr1, addr2, token

    beforeEach(async function() {
        // Get contract factories
        const Token = await ethers.getContractFactory("Token");

        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();

        // Deploy contracts
        token = await Token.deploy();
    });

    describe("Deployment", function() {
        it("Should track name and symbol of the token", async function() {
            expect(await token.name()).to.equal("CasinoTokenName")
            expect(await token.symbol()).to.equal("CSN")
        })
    })
})