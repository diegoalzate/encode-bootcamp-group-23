import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as tokenjson from "../artifacts/contracts/Token.sol/MyToken.json";
import { checkBalance, setupWallet, setupProvider, convertStringArrayToBytes32} from "./utils";

async function deploy (signer: ethers.Wallet, proposals: string[]) {
  if (proposals.length < 2) throw new Error("Not enough proposals provided");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  //STEP 3: Deploy Token and Ballot Contract
  console.log("Deploying Token & Ballot contract");
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );

  const tokenFactory = new ethers.ContractFactory(
    tokenjson.abi,
    tokenjson.bytecode,
    signer
  );

  const tokenContract = await tokenFactory.deploy();
  await tokenContract.deployed();
  console.log("Awaiting confirmations");
  console.log("Token Contract Address: " + tokenContract.address);
  
  const ballotContract = await ballotFactory.deploy(
        convertStringArrayToBytes32(proposals), 
        tokenContract.address
  );
  await ballotContract.deployed();
  console.log("Ballot Contract Address: " + ballotContract.address);

  return {tokenContract: tokenContract.address, ballotContract: ballotContract.address};
}

function saveAddresses (addresses: {tokenContract: string, ballotContract: string})
{
  const fs = require('fs');
  const jsonData = JSON.stringify(addresses);
  fs.writeFile("contracts.json", jsonData, function(err: string) {
    if (err) {
        console.log(err);
    }
  });
}

async function main() {

  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);
  const proposals = process.argv.slice(2);
  const addresses = await deploy(signer, proposals);
  saveAddresses(addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
