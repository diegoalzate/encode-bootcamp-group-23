import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { CustomBallotV2, MyToken } from "../typechain";

const PROPOSALS = ["Pepporoni", "Anchovey", "Extra Cheese"];
const TEST = .55555

const BASE_VOTE_POWER = "10";
const PROPOSAL_CHOSEN = [0, 1, 2];
const USED_VOTE_POWER = 5;
const ACCOUNTS_FOR_TESTING = 3;

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

describe("Ballot", function () {
  let ballotContract: CustomBallotV2;
  let ballotFactory: any;
  let tokenContractFactory: any;
  let tokenContract: MyToken;
  let accounts: SignerWithAddress[];
  let voteTx: any;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    //NB: Ballot Not Deployed!
    [ballotFactory, tokenContractFactory] = await Promise.all([
      ethers.getContractFactory("CustomBallotV2"),
      ethers.getContractFactory("MyToken"),
    ]);
    tokenContract = await tokenContractFactory.deploy();
    await tokenContract.deployed();
  });




  describe(`and after all accounts vote for ${PROPOSALS[1]} with with voting power of ${USED_VOTE_POWER}`, async () => {

        
    it(`getProposals returns and array of objects with  ${PROPOSALS[1]} winning by ${USED_VOTE_POWER * ACCOUNTS_FOR_TESTING} votes `, async () => {

      	let mintTx = await tokenContract.mint( accounts[0].address, +BASE_VOTE_POWER)
        await mintTx.wait();

        mintTx = await tokenContract.mint( accounts[1].address, +BASE_VOTE_POWER)
        await mintTx.wait();

        mintTx = await tokenContract.mint( accounts[2].address, +BASE_VOTE_POWER)
        await mintTx.wait();

		let delegateTx = await tokenContract.connect(accounts[0]).delegate(accounts[0].address);
            await delegateTx.wait();
			delegateTx = await tokenContract.connect(accounts[1]).delegate(accounts[1].address);
            await delegateTx.wait();
			delegateTx = await tokenContract.connect(accounts[2]).delegate(accounts[2].address);
            await delegateTx.wait();			

			ballotContract = await ballotFactory.deploy(
				convertStringArrayToBytes32(PROPOSALS),
				tokenContract.address
			  );
			  await ballotContract.deployed();


		await ballotContract.connect(accounts[0]).vote(1, USED_VOTE_POWER)
		await ballotContract.connect(accounts[1]).vote(1, USED_VOTE_POWER)
		await ballotContract.connect(accounts[2]).vote(1, USED_VOTE_POWER)

		const arrayOfProposalObj = await ballotContract.getProposals() 

		//now disect these array of objects for console.log
		arrayOfProposalObj.map( (singleItem, index) =>(
			console.log(`${ethers.utils.parseBytes32String(singleItem.name)} has ${singleItem.voteCount} votes`)
		))

		let winId = +(await ballotContract.winningProposal() )


		expect( PROPOSALS[winId]  ).to.eq(PROPOSALS[1])
		expect( ethers.utils.parseBytes32String( await ballotContract.winnerName() ) ).to.eq(PROPOSALS[1])


    }); 
  })


  
});
