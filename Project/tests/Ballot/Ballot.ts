import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: any[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that already has voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    it("Voter is allowed to vote on proposal and their voted status is true", async function () {
      const assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      const voter = await ballotContract.voters(accounts[1].address);
      expect(voter.weight.toNumber()).to.eq(1);

      const doVote = await ballotContract.connect(accounts[1]).vote(1);
      await doVote.wait();

      const votingStatus = await ballotContract.voters(accounts[1].address);
      expect(votingStatus.voted).to.eq(true);
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("His voting weight goes to 0 and the other guy's voting weight increase by 1", async function () {
      const assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      const delegate = await ballotContract
        .connect(accounts[1])
        .delegate(accounts[0].address);
      await delegate.wait();

      const voter = await ballotContract.voters(accounts[0].address);
      expect(voter.weight.toNumber()).to.eq(2);
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    it("State reverts with error", async function () {
      // const attack = await ballotContract.connect(accounts[8]).giveRightToVote(accounts[8].address);
      // await attack.wait();

      await expect(
        ballotContract.connect(accounts[8]).giveRightToVote(accounts[8].address)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    it("State reverts with error", async function () {
      await expect(
        ballotContract.connect(accounts[8]).vote(1)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    it("Nothing happens to voter with voting rights and someone without any", async function () {
      const assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      await expect(
        ballotContract.connect(accounts[8]).delegate(accounts[3].address)
      ).to.be.revertedWith("");

      const voter = await ballotContract.voters(accounts[1].address);
      expect(voter.weight.toNumber()).to.eq(1);

      await expect(
        ballotContract.connect(accounts[8]).delegate(accounts[3].address)
      ).to.be.revertedWith("");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("Should return 0", async function () {
      const voteResult = await ballotContract.winningProposal();

      console.log("Result: " + voteResult);

      expect(voteResult).to.eq(0);

      // expect(  voteResult ).to.equal( "test proposal 2" )
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("Show index of winning proposal", async function () {
      const proposalIndex = 2;

      const assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      // const voter = await ballotContract.voters(accounts[1].address);
      // expect(voter.weight.toNumber()).to.eq(1);

      const doVote = await ballotContract
        .connect(accounts[1])
        .vote(proposalIndex);
      await doVote.wait();

      const voteResult = await ballotContract.winningProposal();

      console.log("Result: " + voteResult);

      expect(voteResult).to.eq(proposalIndex);

      // const winningName = ethers.utils.parseBytes32String( await ballotContract.winnerName() )

      // console.log('Winning Proposal: ' + winningName)
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("Returns 'Propsal 1'", async function () {
      const winningName = ethers.utils.parseBytes32String(
        await ballotContract.winnerName()
      );

      console.log("Winning Proposal: " + winningName);

      expect(winningName).to.eq("Proposal 1");
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    it("The winning proposalName EQUALS  winningName", async function () {
      const proposalIndex = 2;

      const assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      // const voter = await ballotContract.voters(accounts[1].address);
      // expect(voter.weight.toNumber()).to.eq(1);

      const doVote = await ballotContract
        .connect(accounts[1])
        .vote(proposalIndex);
      await doVote.wait();

      const winningName = ethers.utils.parseBytes32String(
        await ballotContract.winnerName()
      );

      console.log("Winning Proposal: " + winningName);

      const proposalName = ethers.utils.parseBytes32String(
        (await ballotContract.proposals(proposalIndex)).name
      );

      console.log("Proposal Name: " + proposalName);

      expect(winningName).to.eq(proposalName);
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    it("Returns winning proposal index and its name. proposals[winningProposal].name = winningName", async function () {
      let assignVotingRights = await ballotContract.giveRightToVote(
        accounts[1].address
      );
      await assignVotingRights.wait();

      assignVotingRights = await ballotContract.giveRightToVote(
        accounts[2].address
      );
      await assignVotingRights.wait();

      assignVotingRights = await ballotContract.giveRightToVote(
        accounts[3].address
      );
      await assignVotingRights.wait();

      assignVotingRights = await ballotContract.giveRightToVote(
        accounts[4].address
      );
      await assignVotingRights.wait();

      assignVotingRights = await ballotContract.giveRightToVote(
        accounts[5].address
      );
      await assignVotingRights.wait();

      let doVote = await ballotContract
        .connect(accounts[1])
        .vote(1 /*proposalIndex*/);
      await doVote.wait();

      doVote = await ballotContract
        .connect(accounts[2])
        .vote(2 /*proposalIndex*/);
      await doVote.wait();

      doVote = await ballotContract
        .connect(accounts[3])
        .vote(0 /*proposalIndex*/);
      await doVote.wait();

      doVote = await ballotContract
        .connect(accounts[4])
        .vote(0 /*proposalIndex*/);
      await doVote.wait();

      doVote = await ballotContract
        .connect(accounts[5])
        .vote(0 /*proposalIndex*/);
      await doVote.wait();

      const voteResult = await ballotContract.winningProposal();

      console.log("Result: " + voteResult);

      const winningName = ethers.utils.parseBytes32String(
        await ballotContract.winnerName()
      );

      console.log("Winning Proposal: " + winningName);

      const proposalName = ethers.utils.parseBytes32String(
        (await ballotContract.proposals(voteResult)).name
      );

      expect(proposalName).to.eq(winningName);

      expect(
        // proposals[winningProposal()].name = winnerName()
        (await ballotContract.proposals(await ballotContract.winningProposal()))
          .name
      ).to.eq(await ballotContract.winnerName());
    });
  });
});
