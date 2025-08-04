import React, { useContext, useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { create as kuboHttpClient } from 'kubo-rpc-client';
import { pinata } from '../utils/config';

import { MarketAddress, MarketAddressAbi } from './constants';

const extractIDFromPinataURL = (url) => {
  const match = url.match(/\.mypinata\.cloud\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : 'match not found';
};

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressAbi, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setcurrentAccount] = useState('');
  const nftCurrency = 'MATIC';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install metamask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    console.log(accounts);

    if (accounts.length) {
      setcurrentAccount(accounts[0]);
    } else {
      console.log('No acounts found');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install metamask');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    setcurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    try {
      const signedUrl = await pinata.upload.public.createSignedURL({
        expires: 30, // The only required param
      });

      const upload = await pinata.upload.public.file(file).url(signedUrl);
      const url = await pinata.gateways.public.convert(upload.cid);
      const payload = { url: url, id: upload.id };
      return payload;
    } catch (error) {
      console.log('Error uploading file to IPFS', error);
    }
  };

  const createNFT = async (formInput, fileUrl, fileId, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const upload = await pinata.files.public.update({
        id: fileId,
        keyvalues: {
          name: name,
          description: description,
          image: fileUrl,
        },
      });
      console.log(upload);

      const url = await pinata.gateways.public.convert(upload.cid);

      console.log(2);

      await createSale(url, price);

      console.log(3);

      router.push('/');
    } catch (error) {
      console.log(error);
      console.log('Error uploading file to IPFS');
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    console.log(contract);

    const listingPrice = await contract.getListingPrice();

    const transaction = await contract.createToken(url, price, {
      value: listingPrice.toString(),
    });

    await transaction.wait();
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
