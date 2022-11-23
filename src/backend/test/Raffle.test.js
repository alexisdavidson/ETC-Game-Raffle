const { expect } = require("chai")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

describe("Raffle", async function() {
    let deployer, addr1, addr2, token, raffle
    let entryPrice1 = 20_000_000;
    let initialTokenSupply = 10_000_000_000;
    let percentToBurn = 30;
    let percentToTeam = 70;

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

            let playerInitialBalance1 = entryPrice1 * 20
            let playerInitialBalance2 = entryPrice1 * 3

            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(initialTokenSupply);
            await token.connect(deployer).transfer(addr1.address, toWei(playerInitialBalance1));
            await token.connect(deployer).transfer(addr2.address, toWei(playerInitialBalance2));
            let deployerBalance = initialTokenSupply - playerInitialBalance1 - playerInitialBalance2
            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(deployerBalance);
            expect(fromWei(await token.balanceOf(addr1.address))).to.equal(playerInitialBalance1);
            expect(fromWei(await token.balanceOf(addr2.address))).to.equal(playerInitialBalance2);

            await token.connect(addr1).approve(raffle.address, toWei(initialTokenSupply))
            await token.connect(addr2).approve(raffle.address, toWei(initialTokenSupply))
            expect(fromWei(await token.allowance(addr1.address, raffle.address))).to.equal(initialTokenSupply);

            await raffle.connect(addr1).play(0);
            await expect(raffle.connect(addr1).play(0)).to.be.revertedWith('This slot is not free');
            await raffle.connect(addr1).play(1);
            expect(await raffle.participantsCount()).to.equal(2);

            
            await expect(raffle.connect(addr1).pullOut(11)).to.be.revertedWith('Can only leave a slot from 0 to 11');
            await expect(raffle.connect(addr1).pullOut(2)).to.be.revertedWith('This slot was not taken by you');
            
            await raffle.connect(addr1).pullOut(1);
            expect(await raffle.participantsCount()).to.equal(1);
            
            await raffle.connect(addr1).play(1);
            await raffle.connect(addr1).play(2);
            await raffle.connect(addr2).play(3);
            await raffle.connect(addr2).play(4);
            await raffle.connect(addr2).play(5);
            await raffle.connect(addr1).play(6);
            await raffle.connect(addr1).play(7);
            await raffle.connect(addr1).play(8);
            await raffle.connect(addr1).play(9);
            
            expect(await raffle.participantsCount()).to.equal(10);
            await raffle.connect(addr1).play(10);
            expect(await raffle.participantsCount()).to.equal(11);

            expect(fromWei(await token.balanceOf(raffle.address))).to.equal(entryPrice1 * 11);
            expect(fromWei(await token.balanceOf(addr1.address))).to.equal(playerInitialBalance1 - (entryPrice1 * 8));
            expect(fromWei(await token.balanceOf(addr2.address))).to.equal(playerInitialBalance2 - (entryPrice1 * 3));

            // End Raffle called externally
            await raffle.connect(deployer).endRaffle(3);
            expect(fromWei(await token.balanceOf(raffle.address))).to.equal(0);
            expect(fromWei(await token.balanceOf(addr2.address))).to.equal(entryPrice1 * 10);
            deployerBalance += (entryPrice1 * percentToTeam) / 100
            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(deployerBalance);
        })
    })
})