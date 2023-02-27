import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingContract - check onlyOwner functions", function () {
  async function deployOneYearLockFixture() {
    const [alice, bob, claire, david] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, alice, bob, claire, david };
  }

  it("getVoter", async () => {
    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    await voting.connect(claire).getVoter(bob.address);

    await expect(voting.getVoter(bob.address)).to.be.revertedWith(
      "You're not a voter"
    );

    await expect(
      voting.connect(david).getVoter(bob.address)
    ).to.be.revertedWith("You're not a voter");
  });

  it("addProposal & getOneProposal", async () => {
    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    await voting.startProposalsRegistering();

    await expect(voting.connect(david).addProposal("test")).to.be.revertedWith(
      "You're not a voter"
    );

    await expect(voting.connect(bob).addProposal("proposal1"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);

    expect(
      await (
        await voting.connect(claire).getOneProposal(1)
      ).description
    ).to.be.equal("proposal1");

    await expect(voting.connect(david).getOneProposal(1)).to.be.revertedWith(
      "You're not a voter"
    );
  });

  it("vote", async () => {
    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    await voting.startProposalsRegistering();

    await expect(voting.connect(bob).addProposal("proposal1"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);

    expect(
      await (
        await voting.connect(claire).getOneProposal(1)
      ).description
    ).to.be.equal("proposal1");

    await voting.endProposalsRegistering();
    await voting.startVotingSession();

    await expect(voting.connect(david).setVote(1)).to.be.revertedWith(
      "You're not a voter"
    );

    await expect(voting.setVote(1)).to.be.revertedWith("You're not a voter");

    await expect(voting.connect(bob).setVote(1))
      .to.emit(voting, "Voted")
      .withArgs(bob.address, 1);
  });
});
