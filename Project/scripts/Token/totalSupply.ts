import { ethers } from "ethers";
import { 
  setupWallet, 
  setupProvider, 
  getTokenContract} from "../utils";

async function totalSupply(signer: ethers.Wallet) {
  const contract = getTokenContract(signer);
  const totalSupply = await contract.totalSupply();
  console.log("Total supply: ", totalSupply.toNumber());
}

async function main() {
  const wallet = setupWallet();

  const provider = setupProvider();
  const signer = wallet.connect(provider);

  totalSupply(signer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});