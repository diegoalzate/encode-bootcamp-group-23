import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as tokenjson from "../artifacts/contracts/Token.sol/MyToken.json";

//don't bunch up your code so much. it make it hard to read

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

function setupProvider () {
    // const provider = new ethers.providers.AlchemyProvider("ropsten", process.env.ALCHEMY_API_KEY);
    const infuraApiKey = {
      projectId: process.env.INFURA_API_KEY,
      projectSecret: process.env.INFURA_API_SECRET,
    };
    const provider = new ethers.providers.InfuraProvider("ropsten", infuraApiKey);
    return provider;
}

function setupWallet () {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  return wallet;
}

async function checkBalance (signer: ethers.Wallet)
{
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
}

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
  // console.log(addresses);
  saveAddresses(addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
