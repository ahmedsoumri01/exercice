import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from './AppContext';
import toast from 'react-hot-toast';
import MetaMaskIcon from './assets/images.png';

const Home = () => {
  const { web3, account, contract, connectToMetaMask, disconnectFromMetaMask, connected, connecting } = useAppContext();
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState('idle');
  const [number, setNumber] = useState('');

  const getNumber = async () => {
    try {
      setIsLoading('fetching');
      const number = await contract.methods.getData().call();
      setNumber(number);
      setIsLoading('idle');
    } catch (error) {
      setIsLoading('idle');
      toast.error('Error in fetching number');
    }
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();
    if (inputRef.current.value === '') {
      return;
    }

    try {
      setIsLoading('adding');
      if (!account) {
        toast.error('Please connect to your wallet');
        setIsLoading('idle');
        return;
      }

      await contract.methods.setData(parseInt(inputRef.current.value)).send({
        from: account,
        gas: 3000000,
      })
      .on('receipt', () => {
        inputRef.current.value = '';
        getNumber();
        toast.success('Number added successfully');
        setIsLoading('idle');
      })
      .on('error', () => {
        throw new Error('Error in adding number');
      });
    } catch (error) {
      toast.error('Error in adding number');
      setIsLoading('idle');
    }
  };

  useEffect(() => {
    if (connected) {
      getNumber();
    }
  }, [connected]);

  return (
    <section className="p-4">
      <div className="flex justify-center mb-4">
        {!connected ? (
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={connectToMetaMask}
          >
            {connecting ? 'Connecting...' : 'Connect to MetaMask'}
            <img className="w-6 h-6 ml-2" src={MetaMaskIcon} alt="MetaMask Icon" />
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={disconnectFromMetaMask}
            >
              Disconnect
            </button>
            <p className="mt-2 text-gray-700">Connected as {account}</p>
          </div>
        )}
      </div>
      <div className="mb-4">
        {isLoading === 'fetching' ? (
          <p>Fetching number...</p>
        ) : (
          <p className="text-xl">
            Number: <span className="font-bold">{number.toString()}</span>
          </p>
        )}
      </div>
      <div>
        <form onSubmit={handleAddNumber} className="flex flex-col items-center">
          <input
            type="number"
            placeholder="Enter number"
            ref={inputRef}
            className="mb-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!connected}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${!connected || isLoading === 'adding' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected || isLoading === 'adding'}
          >
            {isLoading === 'adding' ? 'Adding...' : 'Add Number'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Home;
