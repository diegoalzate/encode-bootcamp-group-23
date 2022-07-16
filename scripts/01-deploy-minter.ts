import { ethers } from "ethers";
import "dotenv/config";
import * as minterJson from "../artifacts/contracts/NFTMinter.sol/NFTMinter.json";

// yarn ts-node scripts/01-deploy-minter.ts


//NB: Team Members' Addresses Removed from Public Repo
const ADDRESS_2 = "0x.."
const ADDRESS_3 = "0x.."
const ADDRESS_4 = "0x.."


const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";


async function main() {

	//STEP 1: Connect Wallet
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
	console.log(`Using address ${wallet.address}`);

	const provider = ethers.providers.getDefaultProvider("ropsten");
	const signer = wallet.connect(provider);

	let balanceBN = await signer.getBalance();
	let balance = Number(ethers.utils.formatEther(balanceBN));
	console.log(`Wallet balance Before Deploying: ${balance}`);
	if (balance < 0.01) {
	throw new Error("Not enough ether");
	}

	//STEP 2:  Arg Check 

	// if (process.argv.length < 4) throw new Error("missing delegate");
	// const delegate = process.argv[3];


	//STEP 3: Deploy Minter Contract

	const factory = new ethers.ContractFactory(
	minterJson.abi,
	minterJson.bytecode,
	signer
	);

	const contract = await factory.deploy( ADDRESS_2, ADDRESS_3, ADDRESS_4)

	await contract.deployed();
	console.log("Awaiting confirmations");
	console.log("Minter Contract Address: " + contract.address);


	balanceBN = await signer.getBalance();
	balance = Number(ethers.utils.formatEther(balanceBN));
	console.log(`Wallet Balance AFTER before deploying ${balance}`);



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
