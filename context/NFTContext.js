import React, { useContext, useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressAbi } from './constants';

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

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount }}>
      {children}
    </NFTContext.Provider>
  );
};
