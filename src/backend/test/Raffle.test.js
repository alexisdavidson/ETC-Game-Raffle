const { expect } = require("chai")
const keccak256 = require("keccak256")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => parseInt(ethers.utils.formatEther(num))

const buf2hex = x => '0x' + x.toString('hex')

const random32Number = () => {
    var temp = '0b';
    for (let i = 0; i < 32; i++)
        temp += Math.round(Math.random());

    const randomNum = BigInt(temp);
    console.log(randomNum.toString());
    return randomNum.toString()
}

describe("Raffle", async function() {
    let deployer, addr1, addr2, token, raffle
    let entryPrice1 = 20_000_000;
    let initialTokenSupply = 10_000_000_000;
    let percentToBurn = 30;
    let percentToTeam = 70;

    let firstRandomNumber = 23444
    let provenance = buf2hex(keccak256(parseInt(firstRandomNumber)))

    beforeEach(async function() {
        // Get contract factories
        const Token = await ethers.getContractFactory("Token");
        const Raffle = await ethers.getContractFactory("Raffle");

        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();

        // Deploy contracts
        token = await Token.deploy(initialTokenSupply);
        raffle = await Raffle.deploy(token.address, toWei(entryPrice1), deployer.address, provenance);
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

            // Start of the first round
            await raffle.connect(addr1).play(0);
            expect(await raffle.participantsCount()).to.equal(1);
            let expectedParticipantsArray = [addr1.address, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"]
            expect(await raffle.getParticipants()).to.deep.equal(expectedParticipantsArray);
            await expect(raffle.connect(addr1).play(0)).to.be.revertedWith('This slot is not free');
            await raffle.connect(addr1).play(1);
            expectedParticipantsArray[1] = addr1.address
            expect(await raffle.getParticipants()).to.deep.equal(expectedParticipantsArray);
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

            // Code snippet from server
                let previousRandomNumber = firstRandomNumber // Read firstRandomNumber from DB
                let nextRandomNumber = random32Number() // Write to DB
                let nextProvenanceHash = buf2hex(keccak256(parseInt(nextRandomNumber)))
                console.log("nextProvenanceHash: " + nextProvenanceHash)
                await raffle.connect(deployer).endRaffle(previousRandomNumber, nextProvenanceHash);
            
            let lastRandomNumber = await raffle.lastRandomNumber()
            let lastWinner = lastRandomNumber % 11
            console.log("lastRandomNumber: " + lastRandomNumber)
            console.log("lastWinner: " + lastWinner)

            // Provenance verification
            expect(buf2hex(keccak256(parseInt(await raffle.lastRandomNumber())))).to.equal(await raffle.lastProvenance())
            
            expect(fromWei(await token.balanceOf(raffle.address))).to.equal(0);
            expect(fromWei(await token.balanceOf(addr2.address))).to.equal(entryPrice1 * 10);
            deployerBalance += (entryPrice1 * percentToTeam) / 100
            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(deployerBalance);

            // Second round with actual random number from server. Let's try randomness and provenance
            await raffle.connect(addr1).play(0);
            await raffle.connect(addr1).play(1);
            await raffle.connect(addr1).play(2);
            await raffle.connect(addr2).play(3);
            await raffle.connect(addr2).play(4);
            await raffle.connect(addr2).play(5);
            await raffle.connect(addr1).play(6);
            await raffle.connect(addr1).play(7);
            await raffle.connect(addr1).play(8);
            await raffle.connect(addr1).play(9);
            await raffle.connect(addr1).play(10);

            let addr1PreviousBalance = fromWei(await token.balanceOf(addr1.address))
            let addr2PreviousBalance = fromWei(await token.balanceOf(addr2.address))

            // Code snippet from server
                previousRandomNumber = nextRandomNumber // Read firstRandomNumber from DB
                nextRandomNumber = random32Number() // Write to DB
                nextProvenanceHash = buf2hex(keccak256(parseInt(nextRandomNumber)))
                await raffle.connect(deployer).endRaffle(previousRandomNumber, nextProvenanceHash);

            lastRandomNumber = await raffle.lastRandomNumber()
            lastWinner = lastRandomNumber % 11
            console.log("lastRandomNumber: " + lastRandomNumber)
            console.log("lastWinner: " + lastWinner)
            
            // Provenance verification
            expect(buf2hex(keccak256(parseInt(lastRandomNumber)))).to.equal(await raffle.lastProvenance())

            // addr2 winner
            if (lastWinner == 3 || lastWinner == 4 || lastWinner == 5) {
                expect(fromWei(await token.balanceOf(addr2.address))).to.equal(addr2PreviousBalance + entryPrice1 * 10);
            } else {
                expect(fromWei(await token.balanceOf(addr1.address))).to.equal(addr1PreviousBalance + entryPrice1 * 10);
            }
            expect(fromWei(await token.balanceOf(raffle.address))).to.equal(0);
            deployerBalance += (entryPrice1 * percentToTeam) / 100
            expect(fromWei(await token.balanceOf(deployer.address))).to.equal(deployerBalance);
        })
    })
})