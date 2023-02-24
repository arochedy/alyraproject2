const VotingContract = artifacts.require("Voting");
const { expectRevert } = require("@openzeppelin/test-helpers");
const truffleAssert = require("truffle-assertions");

contract("VotingContract - check onlyOwner functions", (accounts) => {
  let [alice, bob, claire, david] = accounts;

  let contractInstance;
  beforeEach(async () => {
    contractInstance = await VotingContract.new();
  });

  it("only owner functions", async () => {

    let result = await contractInstance.addVoter(bob);

    truffleAssert.eventEmitted(result, "VoterRegistered", (ev) => {
      return ev.voterAddress == bob;
    });

    expectRevert(contractInstance.addVoter(claire, { from: david }),
      "Ownable: caller is not the owner")

    // await truffleAssert.getVoter(
    //   contractInstance.addVoter(claire, { from: david }),
    //   "Ownable: caller is not the owner"
    // );



    expectRevert(contractInstance.startProposalsRegistering({ from: bob }), "Ownable: caller is not the owner");

    await truffleAssert.passes(
      contractInstance.startProposalsRegistering({ from: alice }),
      ""
    );

    expectRevert(contractInstance.endProposalsRegistering({ from: claire }), "Ownable: caller is not the owner");

    await truffleAssert.passes(
      contractInstance.endProposalsRegistering({ from: alice }),
      ""
    );

    expectRevert(contractInstance.startVotingSession({ from: claire }), "Ownable: caller is not the owner");


    await truffleAssert.passes(
      contractInstance.startVotingSession({ from: alice }),
      ""
    );

    await truffleAssert.reverts(
      contractInstance.endVotingSession({ from: claire }),
      "Ownable: caller is not the owner"
    );


    await truffleAssert.passes(
      contractInstance.endVotingSession({ from: alice }),
      ""
    );
    expectRevert(contractInstance.tallyVotes({ from: claire }), "Ownable: caller is not the owner");


    await truffleAssert.passes(
      contractInstance.tallyVotes({ from: alice }),
      ""
    );

  });



});
