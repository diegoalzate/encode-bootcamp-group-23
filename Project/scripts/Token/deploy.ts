
import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as tokenjson from "../../artifacts/contracts/Token.sol/MyToken.json";
import { 
  checkBalance, 
  setupWallet, 
  setupProvider, 
  saveAddress,
  convertStringArrayToBytes32} from "../utils";


async function deploy (signer: ethers.Wallet) {
  const tokenFactory = new ethers.ContractFactory(
    tokenjson.abi,
    tokenjson.bytecode,
    signer
  );

  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();
  console.log("Token Contract Address: " + tokenContract.address);
  return tokenContract;
}

async function main() {

  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);
  
  const contract = await deploy(signer);
  saveAddress("tokenAddress.json", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});