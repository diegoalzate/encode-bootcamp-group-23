import { ethers } from "ethers";
import "dotenv/config";
import * as tokenSavedAddress from "../tokenAddress.json"
import * as tokenjson from "../artifacts/contracts/Token.sol/MyToken.json";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { MyToken } from "../typechain"
import { CustomBallot } from "../typechain"
import * as ballotSavedAddress from "../ballotAddress.json"

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

export function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

export function setupProvider () {
    // const provider = new ethers.providers.AlchemyProvider("ropsten", process.env.ALCHEMY_API_KEY);
    const infuraApiKey = {
      projectId: process.env.INFURA_API_KEY,
      projectSecret: process.env.INFURA_API_SECRET,
    };
    const provider = new ethers.providers.InfuraProvider("ropsten", infuraApiKey);
    return provider;
}

export function setupWallet () {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  return wallet;
}

export async function checkBalance (signer: ethers.Wallet)
{
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
}
 
export function saveAddress (filename: string, address: string) 
{
  const fs = require('fs');
  const jsonData = {
    address: address,
  };
  const jsonDataStr = JSON.stringify(jsonData);
  fs.writeFile(filename, jsonDataStr, function(err: string) {
    if (err) {
        console.log(err);
    }
  });
}

export async function reportGas(transactionReceipt: any) {
  const gasUsed = transactionReceipt.gasUsed;
  const effectiveGasPrice = transactionReceipt.effectiveGasPrice;
  const txFee = gasUsed.mul(effectiveGasPrice);
  console.log("Gas spent: ", gasUsed.toString(), " fee: ", txFee.toString());
}

export function getTokenContract (signer: ethers.Wallet)
{
  console.log("Saved Token address: ", tokenSavedAddress.address);
  const tokenFactory = new ethers.ContractFactory(
    tokenjson.abi,
    tokenjson.bytecode,
    signer
  );
  return tokenFactory.attach(tokenSavedAddress.address) as MyToken;
}

export function getBallotContract (signer: ethers.Wallet) {
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  const ballotContract = ballotFactory.attach(ballotSavedAddress.address) as CustomBallot;
  return ballotContract;
}