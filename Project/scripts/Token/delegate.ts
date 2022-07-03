
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getTokenContract,
  reportGas,
  convertStringArrayToBytes32} from "../utils";
import * as tokenjson from "../../artifacts/contracts/Token.sol/MyToken.json";
import * as savedAddress from "../../tokenAddress.json"
import { MyToken } from "../../typechain"

async function delgate(signer: ethers.Wallet, dest: string) {
  const contract = getTokenContract(signer);
  const before = await contract.delegates(signer.address);
  console.log("Before transaction signer delegates to :", before);
  console.log("Delegating to ", dest);
  const tx = await contract.delegate(dest);
  console.log("Awaiting confirmations");
  const txReceipt = await tx.wait();
  reportGas(txReceipt);
  const after = await contract.delegates(signer.address);
  console.log("After transaction signer delegates to :", after);
  console.log("Transaction block: ", txReceipt.blockNumber);
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);
  
  if (process.argv.length < 3) {
    console.log("Missing delegatee.");
    return;
  }
  let dest: string;
  if (process.argv[2] === "ZERO") {
    dest = ZERO_ADDRESS;
  }
  else if (process.argv[2] === "SELF") {
    dest = signer.address;
  }
  else {
    dest = process.argv[2];
  }
  
  delgate(signer, dest);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});