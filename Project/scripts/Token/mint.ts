
import { ethers } from "ethers";
import { 
  checkBalance,
  setupWallet, 
  setupProvider, 
  reportGas,
  getTokenContract,
  convertStringArrayToBytes32} from "../utils";
import * as tokenjson from "../../artifacts/contracts/Token.sol/MyToken.json";
import * as savedAddress from "../../tokenAddress.json"
import { MyToken } from "../../typechain"
import { BigNumber } from "ethers";

async function mint (signer: ethers.Wallet, dest: string, amount: number) {
  
  const contract = getTokenContract(signer);
  const beforeTotalSupply = await contract.totalSupply()
  console.log("Total supply before minting: ", beforeTotalSupply.toString());
  console.log("Minting ", amount.toString(), " to ", dest);
  const mintTx = await contract.mint(dest, amount);
  console.log("Awaiting confirmations");
  const mintTxReceipt = await mintTx.wait();
  reportGas(mintTxReceipt);
  
  const afterTotalSupply = await contract.totalSupply()
  console.log("Total supply after minting: ", afterTotalSupply.toString());
  const newBalance = await contract.balanceOf(dest);
  console.log("New user balance: ", newBalance.toString());
}

async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  await checkBalance(signer);
  
  // console.log(process.argv);
  if (process.argv.length < 3) {
    console.log("Missing amount.");
    return;
  }
  const amount = +(process.argv[2]);
  let dest = signer.address;
  if (process.argv.length >= 4) {
    dest = process.argv[3];
  }
  else {
    console.log("Minting to the signer address");
  }

  mint(signer, dest, amount);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
