import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const main = async () => {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  if (process.argv.length < 3) throw new Error("missing ballot address as arg");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("missing delegate");
  const delegate = process.argv[3];
  const ballotContract = new ethers.Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  try {
    console.log(`${signer.address} is delagating vote to ${delegate}`);
    const tx = await ballotContract.delegate(delegate);
    console.log("Waiting for confirmation");
    await tx.wait();
    console.log(`Delegate Transaction Completed. Hash: ${tx.hash}`);
  } catch (e: any) {
    console.log(e);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
