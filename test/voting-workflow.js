const VotingContract = artifacts.require("Voting");
const truffleAssert = require("truffle-assertions");
const {
  BN,           // Big Number support
  expect,      // Assertions  
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract("VotingContract - classic workflow", (accounts) => {
  let [alice, bob, claire, david] = accounts;

  let contractInstance;
  beforeEach(async () => {
    contractInstance = await VotingContract.new();
  });

  it("addVoter", async () => {

    let addBobResult = await contractInstance.addVoter(bob);
    truffleAssert.eventEmitted(addBobResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == bob;
    });
    expectEvent(addBobResult, "VoterRegistered", { voterAddress: bob });

    await truffleAssert.reverts(contractInstance.addVoter(bob), "Already registered");

    let addClaireResult = await contractInstance.addVoter(claire);
    truffleAssert.eventEmitted(addClaireResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == claire;
    });
    expectEvent(addClaireResult, "VoterRegistered", { voterAddress: claire });


    let bobIsVoter = await contractInstance.getVoter(bob, { from: bob });
    assert(bobIsVoter.isRegistered == true)

    let claireIsVoter = await contractInstance.getVoter(claire, { from: bob });
    assert(claireIsVoter.isRegistered == true)

    let davidIsNotVoter = await contractInstance.getVoter(david, { from: bob });
    assert(davidIsNotVoter.isRegistered == false)
    // expect.(davidIsNotVoter.isRegistered).to.be.false;

  });

  it("Basic worklow normal", async () => {
    /*    
    Worklow "classique" : on ajoute 2 votants : bob et claire, bob ajoute 2 propositions et claire 1
    bob et claire votent pour la prop 3 
    La proposition 3 gagne avec 2 votes
    */

    await contractInstance.addVoter(bob);
    await contractInstance.addVoter(claire);

    //Proposals
    let result = await contractInstance.startProposalsRegistering();

    // truffleAssert.eventEmitted(result, "WorkflowStatusChange", (ev) => {
    //   return ev.previousStatus == 0 && ev.newStatus == 1;
    // });
    expectEvent(result, "WorkflowStatusChange", { previousStatus: BN(0), newStatus: BN(1) });

    let resultAddProposal = await contractInstance.addProposal("test", { from: bob });
    // truffleAssert.eventEmitted(resultAddProposal, "ProposalRegistered", (ev) => {
    //   return ev.proposalId == 1;
    // });
    expectEvent(resultAddProposal, "ProposalRegistered", { proposalId: BN(1) });

    let resultAddProposal2 = await contractInstance.addProposal("test 2", { from: bob });
    // truffleAssert.eventEmitted(resultAddProposal2, "ProposalRegistered", (ev) => {
    //   return ev.proposalId == 2;
    // });
    expectEvent(resultAddProposal2, "ProposalRegistered", { proposalId: BN(2) });

    let resultAddProposal3 = await contractInstance.addProposal("test 3", { from: claire });
    // truffleAssert.eventEmitted(resultAddProposal3, "ProposalRegistered", (ev) => {
    //   return ev.proposalId == 3;
    // });
    expectEvent(resultAddProposal3, "ProposalRegistered", { proposalId: BN(3) });

    await contractInstance.endProposalsRegistering();
    //end proposals

    //votes
    await contractInstance.startVotingSession();

    let resultVoteBob_3 = await contractInstance.setVote(3, { from: bob });
    // truffleAssert.eventEmitted(resultVoteBob_3, "Voted", (ev) => {
    //   return ev.voter == bob && ev.proposalId == 3;
    // });
    expectEvent(resultVoteBob_3, "Voted", { voter: bob, proposalId: BN(3) });

    // await truffleAssert.reverts(
    //   contractInstance.setVote(0, { from: bob }),
    //   "You have already voted"
    // );
    expectRevert(contractInstance.setVote(0, { from: bob }), "You have already voted")

    let resultVoteClaire3 = await contractInstance.setVote(3, { from: claire });
    // truffleAssert.eventEmitted(resultVoteClaire3, "Voted", (ev) => {
    //   return ev.voter == claire && ev.proposalId == 3;
    // });
    expectEvent(resultVoteClaire3, "Voted", { voter: claire, proposalId: BN(3) });
    //fin des votes

    await contractInstance.endVotingSession();


    await contractInstance.tallyVotes();

    let winner = await contractInstance.winningProposalID({ from: bob });
    assert.equal(winner, 3);


    let winningProposal = await contractInstance.getOneProposal(winner, { from: bob });
    assert.equal(winningProposal.description, "test 3");
    assert.equal(winningProposal.voteCount, 2);


  });

  it("Basic worklow - egality", async () => {
    /*    
    Worklow "classique" : on ajoute 2 votants : bob et claire, bob ajoute 2 propositions et claire 1
    bob vote pour la proposition 2 et claire pour la 3
    il y a égalité mais la proposition 2 est la plus ancienne donc elle gagne
    */

    await contractInstance.addVoter(bob);
    await contractInstance.addVoter(claire);

    let result = await contractInstance.startProposalsRegistering();

    truffleAssert.eventEmitted(result, "WorkflowStatusChange", (ev) => {
      return ev.previousStatus == 0 && ev.newStatus == 1;
    });


    let resultAddProposal = await contractInstance.addProposal("test", { from: bob });
    truffleAssert.eventEmitted(resultAddProposal, "ProposalRegistered", (ev) => {
      return ev.proposalId == 1;
    });

    let resultAddProposal2 = await contractInstance.addProposal("test 2", { from: bob });
    truffleAssert.eventEmitted(resultAddProposal2, "ProposalRegistered", (ev) => {
      return ev.proposalId == 2;
    });

    let resultAddProposal3 = await contractInstance.addProposal("test 3", { from: claire });
    truffleAssert.eventEmitted(resultAddProposal3, "ProposalRegistered", (ev) => {
      return ev.proposalId == 3;
    });

    await contractInstance.endProposalsRegistering();

    await contractInstance.startVotingSession();
    //on peut voter

    let resultVoteBob_2 = await contractInstance.setVote(2, { from: bob });
    truffleAssert.eventEmitted(resultVoteBob_2, "Voted", (ev) => {
      return ev.voter == bob && ev.proposalId == 2;
    });


    await truffleAssert.reverts(
      contractInstance.setVote(0, { from: bob }),
      "You have already voted"
    );

    let resultVoteClaire3 = await contractInstance.setVote(3, { from: claire });
    truffleAssert.eventEmitted(resultVoteClaire3, "Voted", (ev) => {
      return ev.voter == claire && ev.proposalId == 3;
    });


    await contractInstance.endVotingSession();
    //fin des votes

    await contractInstance.tallyVotes();

    let winner = await contractInstance.winningProposalID({ from: bob });
    assert.equal(winner, 2);


    let winningProposal = await contractInstance.getOneProposal(winner, { from: bob });
    assert.equal(winningProposal.description, "test 2");
    assert.equal(winningProposal.voteCount, 1);


  });

  it("worklow order errors", async () => {

    expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended");
    expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    expectRevert(contractInstance.endProposalsRegistering(), "Registering proposals havent started yet");
    expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");

    await contractInstance.startProposalsRegistering();

    expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended.");
    expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");
    expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");

    await contractInstance.endProposalsRegistering();

    expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended.");
    expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    expectRevert(contractInstance.endProposalsRegistering(), "Registering proposals havent started yet");
    expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");

    await contractInstance.startVotingSession();

    expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");
    expectRevert(contractInstance.endProposalsRegistering(), "Registering proposals havent started yet");
    expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended.");
    expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");

    await contractInstance.endVotingSession();

    expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");
    expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    expectRevert(contractInstance.endProposalsRegistering(), "Registering proposals havent started yet");
    expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");

    await contractInstance.tallyVotes();

    expectRevert(contractInstance.tallyVotes(), "Current status is not voting session ended.");
    expectRevert(contractInstance.startVotingSession(), "Registering proposals phase is not finished");
    expectRevert(contractInstance.endVotingSession(), "Voting session havent started yet");
    expectRevert(contractInstance.endProposalsRegistering(), "Registering proposals havent started yet");
    expectRevert(contractInstance.startProposalsRegistering(), "Registering proposals cant be started now");


  });

});
