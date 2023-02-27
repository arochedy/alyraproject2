import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingContract - basic workflow", function () {
  async function deployOneYearLockFixture() {
    const [alice, bob, claire, david] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, alice, bob, claire, david };
  }

  it("add voters", async () => {
    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    await expect(voting.addVoter(claire.address)).to.be.revertedWith(
      "Already registered"
    );

    // await voting.startProposalsRegistering();

    let getbobVoter = await voting.connect(claire).getVoter(bob.address);
    expect(getbobVoter.isRegistered).to.be.true;
    expect(getbobVoter.hasVoted).to.be.false;
    expect(getbobVoter.votedProposalId).to.be.equal(0);

    let davidIsNotVoter = await voting.connect(bob).getVoter(david.address);
    expect(davidIsNotVoter.isRegistered).to.be.false;
  });

  it("Basic worklow normal", async () => {
    /*    
    Worklow "classique" : on ajoute 2 votants : bob et claire, bob ajoute 2 propositions et claire 1
    bob et claire votent pour la prop 3
    La proposition 3 gagne avec 2 votes
    */

    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    //Proposals
    await expect(voting.startProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(0, 1);

    await expect(voting.addVoter(claire.address)).to.be.revertedWith(
      "Voters registration is not open yet"
    );

    await expect(voting.connect(bob).addProposal("test"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);

    await expect(voting.connect(bob).setVote(1)).to.be.revertedWith(
      "Voting session havent started yet"
    );

    await expect(voting.connect(bob).addProposal("test 2"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(2);

    await expect(voting.connect(claire).addProposal("test 3"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(3);

    await expect(voting.connect(claire).addProposal("")).to.be.revertedWith(
      "Vous ne pouvez pas ne rien proposer"
    );

    await expect(voting.endProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(1, 2);

    //end proposals

    //votes

    await expect(voting.startVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(2, 3);

    await expect(voting.connect(bob).setVote(10)).to.be.revertedWith(
      "Proposal not found"
    );

    await expect(voting.connect(bob).setVote(3))
      .to.emit(voting, "Voted")
      .withArgs(bob.address, 3);

    await expect(voting.connect(bob).setVote(1)).to.be.revertedWith(
      "You have already voted"
    );

    await expect(voting.connect(claire).setVote(3))
      .to.emit(voting, "Voted")
      .withArgs(claire.address, 3);

    //fin des votes

    await expect(voting.endVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(3, 4);

    await expect(voting.tallyVotes())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(4, 5);

    let winner = await voting.connect(bob).winningProposalID();
    expect(winner).to.be.equal(3);

    let winningProposal = await voting.connect(bob).getOneProposal(winner);
    expect(winner).to.be.equal(3);
    expect(winningProposal.description).to.be.equal("test 3");
    expect(winningProposal.voteCount).to.be.equal(2);
  });

  it("Basic worklow normal - equality", async () => {
    /*    
    Worklow "classique" : on ajoute 2 votants : bob et claire, bob ajoute 2 propositions et claire 1
    bob vote pour la proposition 2 et claire pour la 3
    il y a égalité mais la proposition 2 est la plus ancienne donc elle gagne
    */

    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    await expect(voting.addVoter(bob.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(bob.address);

    await expect(voting.addVoter(claire.address))
      .to.emit(voting, "VoterRegistered")
      .withArgs(claire.address);

    await expect(voting.connect(bob).addProposal("test")).to.be.revertedWith(
      "Proposals are not allowed yet"
    );

    //Proposals
    await expect(voting.startProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(0, 1);

    await expect(voting.connect(bob).addProposal("test"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(1);

    await expect(voting.connect(bob).addProposal("test 2"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(2);

    await expect(voting.connect(claire).addProposal("test 3"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(3);

    await expect(voting.endProposalsRegistering())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(1, 2);

    //end proposals

    //votes

    await expect(voting.startVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(2, 3);

    await expect(voting.connect(bob).setVote(2))
      .to.emit(voting, "Voted")
      .withArgs(bob.address, 2);

    await expect(voting.connect(claire).setVote(3))
      .to.emit(voting, "Voted")
      .withArgs(claire.address, 3);

    //fin des votes

    await expect(voting.endVotingSession())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(3, 4);

    await expect(voting.tallyVotes())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(4, 5);

    let winner = await voting.connect(bob).winningProposalID();
    expect(winner).to.be.equal(2);

    let winningProposal = await voting.connect(bob).getOneProposal(winner);
    expect(winner).to.be.equal(2);
    expect(winningProposal.description).to.be.equal("test 2");
    expect(winningProposal.voteCount).to.be.equal(1);
  });

  it("Workflow order errors", async () => {
    /*    
     Worklow "classique" : on ajoute 2 votants : bob et claire, bob ajoute 2 propositions et claire 1
     bob vote pour la proposition 2 et claire pour la 3
     il y a égalité mais la proposition 2 est la plus ancienne donc elle gagne
     */

    const { voting, alice, bob, claire, david } = await loadFixture(
      deployOneYearLockFixture
    );

    let errorTallyVotes = "Current status is not voting session ended";
    let errorEndVotingSession = "Voting session havent started yet";
    let endProposalsRegistering = "Registering proposals havent started yet";
    let startVotingSession = "Registering proposals phase is not finished";
    let startProposalsRegistering = "Registering proposals cant be started now";

    await expect(voting.tallyVotes()).to.be.revertedWith(errorTallyVotes);

    await expect(voting.endVotingSession()).to.be.revertedWith(
      errorEndVotingSession
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      endProposalsRegistering
    );

    await expect(voting.startVotingSession()).to.be.revertedWith(
      startVotingSession
    );

    await voting.startProposalsRegistering();

    await expect(voting.tallyVotes()).to.be.revertedWith(errorTallyVotes);

    await expect(voting.endVotingSession()).to.be.revertedWith(
      errorEndVotingSession
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      startProposalsRegistering
    );

    await expect(voting.startVotingSession()).to.be.revertedWith(
      startVotingSession
    );

    // expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended.");
    // expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    // expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");
    // expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");

    await voting.endProposalsRegistering();

    await expect(voting.tallyVotes()).to.be.revertedWith(errorTallyVotes);

    await expect(voting.endVotingSession()).to.be.revertedWith(
      errorEndVotingSession
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      endProposalsRegistering
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      startProposalsRegistering
    );

    await voting.startVotingSession();

    await expect(voting.tallyVotes()).to.be.revertedWith(errorTallyVotes);

    await expect(voting.startVotingSession()).to.be.revertedWith(
      startVotingSession
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      endProposalsRegistering
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      startProposalsRegistering
    );

    await voting.endVotingSession();

    await expect(voting.endVotingSession()).to.be.revertedWith(
      errorEndVotingSession
    );

    await expect(voting.startVotingSession()).to.be.revertedWith(
      startVotingSession
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      endProposalsRegistering
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      startProposalsRegistering
    );

    await voting.tallyVotes();

    await expect(voting.tallyVotes()).to.be.revertedWith(errorTallyVotes);
    await expect(voting.endVotingSession()).to.be.revertedWith(
      errorEndVotingSession
    );

    await expect(voting.startVotingSession()).to.be.revertedWith(
      startVotingSession
    );

    await expect(voting.endProposalsRegistering()).to.be.revertedWith(
      endProposalsRegistering
    );

    await expect(voting.startProposalsRegistering()).to.be.revertedWith(
      startProposalsRegistering
    );
  });
});
