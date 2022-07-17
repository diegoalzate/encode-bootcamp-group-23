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
import Link from 'next/link'

let numberOfNftsDisplayed = 10

export default function Home() {
  const [nfts, setNfts] = useState<any>([])
  const [loadingState, setLoadingState] = useState('not-loaded')

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

  const getDisplayTokens = () => {
    let displayNfts = nfts
    return displayNfts.slice(-numberOfNftsDisplayed).reverse()
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No nfts minted yet.</h1>)

  return (
    <div>
      <div className='flex flex-col items-center p-4 space-y-4'>
        <h1 className='text-4xl'>Group 25</h1>
        <h2>Contract address <Link href={`https://ropsten.etherscan.io/address/${contractAddress}`}><span  className=' cursor-pointer underline decoration-green-400 decoration-wavy'>{contractAddress}</span></Link></h2>
      </div>
      <NftList nfts={getDisplayTokens()}></NftList>
    </div>
  )
}
