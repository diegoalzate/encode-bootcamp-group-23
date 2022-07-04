
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  getTokenContract,
  reportGas,
  convertStringArrayToBytes32} from "../utils";
import { BigNumber } from "ethers";

async function transfer(signer: ethers.Wallet, dest: string, amount: BigNumber) {
  const contract = getTokenContract(signer);
  console.log("Transfer destiny: ", dest);
  const beforeSrc = await contract.balanceOf(signer.address);
  const beforeDest = await contract.balanceOf(dest);
  console.log("Balances before transaction: ", beforeSrc.toNumber(), " ", beforeDest.toNumber());
  console.log("Transfering ", amount.toString());
  const tx = await contract.transfer(dest, amount);
  console.log("Awaiting confirmations");
  const txReceipt = await tx.wait();
  reportGas(txReceipt);
  const afterSrc = await contract.balanceOf(signer.address);
  const afterDest = await contract.balanceOf(dest);
  console.log("Balances after transaction: ", afterSrc.toNumber(), " ", afterDest.toNumber());
}

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);
  
  if (process.argv.length < 3) {
    console.log("Missing transfer destiny.");
    return;
  }

  if (process.argv.length < 4) {
    console.log("Missing transfer amount.");
    return;
  }

  const amount = +(process.argv[3]);
  if (typeof amount !== "number") {
    console.log("Amount is not a number.");
    return;
  }

  transfer(signer, process.argv[2], BigNumber.from(amount));
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});