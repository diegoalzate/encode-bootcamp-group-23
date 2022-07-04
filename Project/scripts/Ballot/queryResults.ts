
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getBallotContract,
  reportGas,
  getTokenContract,
  convertStringArrayToBytes32} from "../utils";

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const ballotContract = getBallotContract(signer);
  const winningProposal = await ballotContract.winningProposal();
  let winnerName = await ballotContract.winnerName();
  winnerName = ethers.utils.parseBytes32String(winnerName);
  console.log("Ballot winning proposal: ", winningProposal.toString(), " ", winnerName);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});