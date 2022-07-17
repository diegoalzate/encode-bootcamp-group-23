import react from "react";

const NftItem = ({nft, buttonTitle, buttonFunc}) => {
  return (
    <div  className="border shadow rounded-xl overflow-hidden">
      <img src={nft.image} width={300}/>
      <div className="p-4">
        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
        <div style={{ height: '70px', overflow: 'hidden' }}>
          <p className="text-gray-400">{nft.description}</p>
        </div>
        {JSON.stringify(nft, null, '\n')}
      </div>
      {/* <div className="p-4 bg-black">
        <p className="text-2xl font-bold text-white">{nft.donationBalance} ETH</p>
        <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={buttonFunc}>{buttonTitle}</button>
      </div> */}
    </div>
  )
}

export default NftItem