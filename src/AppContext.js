import { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import { abi, address } from './utils/constant';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectToMetaMask = async () => {
    setConnecting(true);
    try {
      if (window.ethereum) {
        const provider = window.ethereum;
        await provider.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(provider);
        const accounts = await web3Instance.eth.getAccounts();
        const userAccount = accounts[0];

        setAccount(userAccount);
        setWeb3(web3Instance);
        setContract(new web3Instance.eth.Contract(abi, address));
        setConnected(true);
      } else {
        console.log("Non-Ethereum browser detected. You should install MetaMask.");
      }
    } catch (err) {
      console.error("Failed to connect to MetaMask:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectFromMetaMask = () => {
    setConnected(false);
    setAccount('');
    setWeb3(null);
    setContract(null);
  };

  return (
    <AppContext.Provider value={{ account, web3, contract, connectToMetaMask, disconnectFromMetaMask, connected, connecting }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
