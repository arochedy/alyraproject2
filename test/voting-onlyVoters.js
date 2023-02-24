const VotingContract = artifacts.require("Voting");
const truffleAssert = require("truffle-assertions");

contract("VotingContract - check onlyVoters functions", (accounts) => {
  let [alice, bob, claire, david] = accounts;

  let contractInstance;
  beforeEach(async () => {
    contractInstance = await VotingContract.new();
  });

  it("getVoter", async () => {

    let addBobVoterResult = await contractInstance.addVoter(bob);

    truffleAssert.eventEmitted(addBobVoterResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == bob;
    });

    let addClaireResult = await contractInstance.addVoter(claire);

    truffleAssert.eventEmitted(addClaireResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == claire;
    });

    let voterBob = await contractInstance.getVoter(bob, { from: claire })
    assert.equal(voterBob.isRegistered, true);

    await truffleAssert.reverts(
      contractInstance.getVoter(claire),
      "You're not a voter"
    );

    await truffleAssert.reverts(
      contractInstance.getVoter(claire, { from: david }),
      "You're not a voter"
    );


  });





  it("addProposal & getOneProposal", async () => {

    let addBobVoterResult = await contractInstance.addVoter(bob);

    truffleAssert.eventEmitted(addBobVoterResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == bob;
    });

    let addClaireResult = await contractInstance.addVoter(claire);

    truffleAssert.eventEmitted(addClaireResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == claire;
    });


    await truffleAssert.passes(
      contractInstance.startProposalsRegistering({ from: alice }),
      ""
    );


    await truffleAssert.reverts(
      contractInstance.addProposal("test", { from: david }),
      "You're not a voter"
    );


    let addProposalResult = await contractInstance.addProposal("proposal1", { from: bob });

    truffleAssert.eventEmitted(addProposalResult, "ProposalRegistered", (ev) => {
      return ev.proposalId == 1;
    });


    let getProposalResult = await contractInstance.getOneProposal(1, { from: claire });
    assert.equal("proposal1", getProposalResult.description);

    await truffleAssert.reverts(
      contractInstance.getOneProposal(1, { from: david }),
      "You're not a voter"
    );


  });

  it("vote", async () => {

    let addBobVoterResult = await contractInstance.addVoter(bob);

    truffleAssert.eventEmitted(addBobVoterResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == bob;
    });

    let addClaireResult = await contractInstance.addVoter(claire);

    truffleAssert.eventEmitted(addClaireResult, "VoterRegistered", (ev) => {
      return ev.voterAddress == claire;
    });

    await truffleAssert.passes(
      contractInstance.startProposalsRegistering({ from: alice }),
      ""
    );

    let addProposalResult = await contractInstance.addProposal("proposal1", { from: bob });

    truffleAssert.eventEmitted(addProposalResult, "ProposalRegistered", (ev) => {
      return ev.proposalId == 1;
    }
    );


    await truffleAssert.passes(
      contractInstance.endProposalsRegistering({ from: alice }),
      ""
    );

    await truffleAssert.passes(
      contractInstance.startVotingSession({ from: alice }),
      ""
    );

    await truffleAssert.reverts(
      contractInstance.setVote(1, { from: david }),
      "You're not a voter"
    );

    let voteResult = await contractInstance.setVote(1, { from: bob });

    truffleAssert.eventEmitted(voteResult, "Voted", (ev) => {
      return ev.proposalId == 1;
    }
    );


  })
});
