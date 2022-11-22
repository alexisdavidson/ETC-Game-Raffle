const { expect } = require("chai")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

describe("Raffle", async function() {
    let deployer, addr1, addr2, token, raffle
    let entryPrice1 = 20_000_000;
    let initialTokenSupply = 10_000_000_000;

    beforeEach(async function() {
        // Get contract factories
        const Token = await ethers.getContractFactory("Token");
        const Raffle = await ethers.getContractFactory("Raffle");

        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();

        // Deploy contracts
        token = await Token.deploy(initialTokenSupply);
        raffle = await Raffle.deploy(token.address, toWei(entryPrice1), deployer.address);
    });

    describe("Deployment", function() {
        it("Should have the correct entre price", async function() {
            expect(fromWei(await raffle.entryPrice())).to.equal(entryPrice1);
        })
        it("Should enter raffle by playing", async function() {
            await expect(raffle.connect(addr1).play(11)).to.be.revertedWith('Can only enter a slot from 0 to 10');

            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(initialTokenSupply);
            await token.connect(deployer).transfer(addr1.address, toWei(entryPrice1 * 10));
            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(initialTokenSupply - entryPrice1 * 10);
            expect(fromWei(await token.balanceOf(addr1.address))).to.equal(entryPrice1 * 10);

            await token.connect(addr1).approve(raffle.address, toWei(initialTokenSupply))
            expect(fromWei(await token.allowance(addr1.address, raffle.address))).to.equal(initialTokenSupply);

            await raffle.connect(addr1).play(0);
            await expect(raffle.connect(addr1).play(0)).to.be.revertedWith('This slot is not free');
            await raffle.connect(addr1).play(1);
        })
    })
})