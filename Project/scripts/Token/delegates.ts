import { ethers } from "ethers";
import { 
  setupWallet, 
  setupProvider, 
  getTokenContract} from "../utils";

async function delegates(signer: ethers.Wallet, address: string) {
  const contract = getTokenContract(signer);
  const delegates = await contract.delegates(address);
  console.log(address, "delegates to", delegates);
}

async function main() {
  const wallet = setupWallet();

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  
  if (process.argv.length < 3) {
    console.log("Missing address.");
    return;
  }

  delegates(signer, process.argv[2]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});