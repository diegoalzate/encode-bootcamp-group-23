import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  reportGas,
  getTokenContract,
  saveAddress,
  convertStringArrayToBytes32} from "../utils";

async function deploy(signer: ethers.Wallet, proposals: string[]) {
  const tokenContract = getTokenContract(signer);
  
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals), 
    tokenContract.address
  );
  console.log("Awaiting confirmations");
  await ballotContract.deployed();
  console.log("Ballot Contract Address: " + ballotContract.address);
  return ballotContract;
}

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);

  const proposals = process.argv.slice(2);
  if (proposals.length === 0) {
    console.log("Missing proposals.");
    return;
  }
  const contract = await deploy(signer, proposals);
  saveAddress("ballotAddress.json", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});