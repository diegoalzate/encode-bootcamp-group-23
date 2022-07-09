import { ethers } from "ethers";
import { 
  setupWallet, 
  setupProvider, 
  getTokenContract} from "../utils";

async function balanceOf(signer: ethers.Wallet, address: string) {
  const contract = getTokenContract(signer);
  const balance = await contract.balanceOf(address);
  console.log("Balance of ", address);
  console.log(balance.toNumber())
}

async function main() {
  const wallet = setupWallet();

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  
  if (process.argv.length < 3) {
    console.log("Missing address.");
    return;
  }

  balanceOf(signer, process.argv[2]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});