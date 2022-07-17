import react from "react";

const NftItem = ({nft, buttonTitle, buttonFunc}) => {
  return (
    <div  className="border shadow-md rounded-xl overflow-hidden">
      <img src={nft.image}/>
      <div className="px-4">
        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
        <div style={{ height: '70px', overflow: 'hidden' }}>
          <p className="text-gray-400">{nft.description}</p>
        </div>
        <p className="bg-slate-700 text-green-500 rounded-lg p-4 overflow-scroll">
          {JSON.stringify(nft, null, '\n')}
        </p>
      </div>
    </div>
  )
}

export default NftItem