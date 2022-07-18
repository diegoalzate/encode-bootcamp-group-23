import { ethers } from "ethers";
//import hre  from "@nomiclabs/hardhat-ethers"
import "dotenv/config";
import * as minterJson from "../artifacts/contracts/NFTMinter.sol/NFTMinter.json";
import { NFTMinter } from "../typechain";

// yarn ts-node scripts/02-interact-nft.ts

//NB: Team Members' Addresses. Obscured and Removed from Public Repo 
const ADDRESSES = ["0x02b...", "0xB0...", "0x75...", "0x9E..."]

const EXPOSED_KEY = "...";

const contractAddress = "0x46e6A9727D97bC3391C79D6Fa834d096BC7322b6"

const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a"

async function main() {

	const provider = new ethers.providers.InfuraProvider("ropsten", process.env.INFURA_API_KEY)

	//STEP 1: Connect Wallet
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
	console.log(`Using address ${wallet.address}`);

	//const provider = ethers.providers.getDefaultProvider("ropsten");
	const signer = wallet.connect(provider);

	let balanceBN = await signer.getBalance();
	let balance = Number(ethers.utils.formatEther(balanceBN));
	console.log(`Wallet balance Before Deploying: ${balance}`);
	if (balance < 0.01) {
	throw new Error("Not enough ether");
	}

	//STEP 2:  Arg Check 

	const NFTcontract = new ethers.Contract(
		contractAddress,
		minterJson.abi,
		signer
	  ) as NFTMinter;


	  //const contract = await hre.ethers.getContractAt("NFTMinter", contractAddress)
	  const minterRoleCount = +( await NFTcontract.getRoleMemberCount( MINTER_ROLE ) )
	  const pauserRoleCount = +( await NFTcontract.getRoleMemberCount( PAUSER_ROLE ) )
	  console.log("\t Number of Addresses with Mint Privedges: ", minterRoleCount)
	  console.log("\t Number of Addresses with Pause Privedges: ", pauserRoleCount)

		const len = ADDRESSES.length
		for (let i=0; i<len; i++){
			let tx = await NFTcontract.safeMint( ADDRESSES[i], `http://localhost:3000/metadata/${i}` ) 

			console.log(i)
			console.log(tx)
		}

		//let tx = await NFTcontract.safeMint( ADDRESS_1, "http://localhost:3000/metadata/11" ) 

			//console.log(i)
			//console.log(tx)		

	balanceBN = await signer.getBalance();
	balance = Number(ethers.utils.formatEther(balanceBN));
	console.log(`Wallet Balance AFTER before deploying ${balance}`);



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
