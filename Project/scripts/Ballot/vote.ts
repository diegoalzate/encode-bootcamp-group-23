
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  reportGas,
  getBallotContract,
  getTokenContract,
  convertStringArrayToBytes32} from "../utils";
import { CustomBallot } from "../../typechain"
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as ballotSavedAddress from "../../ballotAddress.json"

async function vote(signer: ethers.Wallet, proposal: number) {
  const ballotContract = getBallotContract(signer);
  const votingPower = await ballotContract.votingPower();
  console.log("Voting power: ", votingPower.toString());
  console.log("Awaiting confirmations");
  const tx = await ballotContract.vote(proposal, votingPower);
  const txReceipt = await tx.wait();
  reportGas(txReceipt);
  const votingPowerAfter = await ballotContract.votingPower();
  console.log("Voting power after: ", votingPowerAfter.toString());
}

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);

  if (process.argv.length < 3) {
    console.log("Missing proposal.");
    return;
  }
  const proposal = process.argv[2];
  if (typeof +proposal !== "number") {
    console.log("Proposal should be a number.");
    return;
  }
  vote(signer, +proposal);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});