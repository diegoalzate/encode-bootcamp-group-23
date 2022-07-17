import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import axios, { Axios } from 'axios'

import {
  contractAddress
} from '../config'

import NFTMinter from '../../../NFTMinter.json'

export const ipfsToHTTP = (ipfsName) => ipfsName.replace("ipfs://", "https://ipfs.infura.io/ipfs/");


const forEachNft = async (provider, func) => {
  const values = []
  try {
    const contract = new ethers.Contract(contractAddress, NFTMinter.abi, provider)
    let numberOfTokens = (await contract.totalSupply()).toNumber()
    // temp
    const tempLimit = 10;
    numberOfTokens = numberOfTokens < tempLimit ? numberOfTokens : tempLimit;
    for (let i = 0; i<numberOfTokens; i++) {
      values.push(func(contract, i))
    } 
  }
  catch (error) {
    console.error(error);
  }
  return Promise.all(values)
}

export const getURIs = async (provider) => {
  return forEachNft(provider, (contract, tokenId) => contract.tokenURI(tokenId))
}

export const getNftMetaData = async (provider) => {
  const func = async (contract, tokenId) => {
    const uri = await contract.tokenURI(tokenId)
    const request =  await axios.get(uri)
    return request.data
  }
  return forEachNft(provider, func)
}

export const getNfts = async (provider) => {
  const metaData = await getNftMetaData(provider);
  const nfts = metaData.map((meta, i) => {
    const nft = {...meta}
    nft.tokenId = i
    nft.image = ipfsToHTTP(nft.image)
    return nft
  })
  return nfts
}

