import { ethers } from "ethers";
import { 
  setupWallet, 
  setupProvider, 
  getTokenContract} from "../utils";

async function allowance(signer: ethers.Wallet, spender: string) {
  const contract = getTokenContract(signer);
  const allowance = await contract.allowance(signer.address, spender);
  console.log("Allowance for spender ", spender);
  console.log(allowance.toNumber())
}

async function main() {
  const wallet = setupWallet();

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  
  if (process.argv.length < 3) {
    console.log("Missing spender");
    return;
  }

  allowance(signer, process.argv[2]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});