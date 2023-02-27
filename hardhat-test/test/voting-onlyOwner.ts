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

  describe("Deployment", function () {
    it("Should set good winningProposalID", async function () {
      const { voting } = await loadFixture(deployOneYearLockFixture);

      expect(await voting.winningProposalID()).to.equal(0);
    });

    it("Should set good workflowStatus", async function () {
      const { voting } = await loadFixture(deployOneYearLockFixture);

      expect(await voting.workflowStatus()).to.equal(0);
    });
  });

  describe("Only Owner", function () {
    it("Only Owner functions", async function () {
      const { voting, claire, david, bob, alice } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await voting.winningProposalID()).to.equal(0);

      await expect(voting.addVoter(claire.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(claire.address);

      await expect(
        voting.connect(david).addVoter(claire.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        voting.connect(david).startProposalsRegistering()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(voting.startProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(0, 1);

      await expect(
        voting.connect(david).startVotingSession()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(voting.connect(david).endVotingSession()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(
        voting.connect(david).endProposalsRegistering()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(voting.connect(david).tallyVotes()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
});
