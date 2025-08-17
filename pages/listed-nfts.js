import React, { useContext, useEffect } from 'react';
import { Loader, NFTCard } from '../components';
import { NFTContext } from '../context/NFTContext';

const ListedNFTs = () => {
  const { fetchMyNFTsOrListedNFTS } = useContext(NFTContext);
  const [nfts, setNfts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    fetchMyNFTsOrListedNFTS('fetchItemsListed').then((items) => {
      setNfts(items);
      console.log(items);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isLoading && nfts.length === 0) {
    return (
      <div className="flexCenter sm:p-4 p-16 min-h-screen">
        <h1 className="font-poppins dark:text-white text-black-1 text-3xl font-extrabold">
          No NFTs for Sale
        </h1>
      </div>
    );
  }
  return (
    <div className="flex justify-center sm:px-4 p-12 min-h-screen">
      <div className="w-full minmd:w-4/5">
        <div className="mt-4">
          <h2 className="font-poppins dark:text-white text-black-1 text-2xl font-semibold mt-2 ml-4 sm:ml-2">
            NFTs Listed For Sale
          </h2>
          <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
            {console.log(nfts)}
            {nfts.map((nft) => (
              <NFTCard key={nft.tokenID} nft={nft} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListedNFTs;
