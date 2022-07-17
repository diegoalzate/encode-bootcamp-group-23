// import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import Web3Modal from "web3modal"
import { useEffect, useState } from 'react'
import { 
  getNfts,
} from '../src/clientUtils'
import NftList from '../src/components/nftList'

import {
  contractAddress
} from '../config'

import NFTMinter from '../../../NFTMinter.json'

let numberOfNftsDisplayed = 10

export default function Home() {
  const [nfts, setNfts] = useState<any>([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [filterStr, setFilterStr] = useState('')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs () {
    // fetch last nfts from the blockchain
    // const provider = new ethers.providers.JsonRpcProvider()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const newNfts = await getNfts(provider)
    if (newNfts.length > 0) {
      setNfts(newNfts)
    }
    setLoadingState('loaded')
    console.log(newNfts.slice(-numberOfNftsDisplayed))
  }

  // const searchChange = (event) => {
  //   console.log(event.target.value)
  //   setFilterStr(event.target.value)
  // }

  const getDisplayTokens = () => {
    let displayNfts = nfts
    // let numberFilter = parseInt(filterStr)
    // if (!isNaN(numberFilter) && numberFilter < displayNfts.length) {
    //   displayNfts = [displayNfts[numberFilter]]
    // }
    // else if (filterStr !== '' ) {
    //   displayNfts = displayNfts.filter((nft: any) => nft.name.toLowerCase().includes(filterStr.toLocaleLowerCase()))
    // }
    return displayNfts.slice(-numberOfNftsDisplayed).reverse()
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No nfts minted yet.</h1>)

  return (
    <div>
      <p> Group 25.</p>
      <p> Contract address {contractAddress}</p>
      {/* <SearchBar onSearchChange={searchChange}></SearchBar> */}
      <NftList nfts={getDisplayTokens()}></NftList>
    </div>
  )
}
