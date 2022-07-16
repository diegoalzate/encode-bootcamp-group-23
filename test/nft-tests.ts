import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { NFTMinter } from "../typechain";

describe("NFT Minter Contract", function () {
    let contract: NFTMinter;
    let accounts: SignerWithAddress[];
    
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
    const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a"



    beforeEach(async () => {

        accounts = await ethers.getSigners();
        const factory = await ethers.getContractFactory("NFTMinter");
        contract = await factory.deploy( accounts[1].address, accounts[2].address, accounts[3].address )
          
        await contract.deployed();
      });
      
    describe("when the contract is deployed", function () {


     it("Should allow querying minter role", async function() {

        // let minterCount: number
        const minterCount = +( await contract.getRoleMemberCount( MINTER_ROLE ) )

        console.log("\t Number of Addresses with Mint Privedges: ", minterCount)


        const members = [];
        for (let i = 0; i < minterCount; ++i) {
            members.push(await contract.getRoleMember( MINTER_ROLE, i));
        }

        console.log("\t Addresses with Mint Privileges ", members)

        expect(minterCount).to.equal(4)

        // console.log(await contract.MINTER_ROLE())
        // console.log(await contract.PAUSER_ROLE())
        // console.log(await contract.DEFAULT_ADMIN_ROLE())

     })

     it("Should allow minting an NFT", async function() {

        const nft = await contract.safeMint( accounts[0].address, 'https://example.com')
        await nft.wait();

        let tokenURI = await contract.tokenURI(0)

        console.log('\t Dummy Token URI: ', tokenURI)

        expect(tokenURI).to.equal('https://example.com')




     })

    })

})    