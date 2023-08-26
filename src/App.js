import React, { useState } from 'react';
import './App.css';
import Navbar from './components/navbar';
import MainDisplay from './components/maindisplay';
import Button from './components/button';

function App() {

  const [walletStatus, setWalletStatus] = useState('XXX');
  const [walletNetworks, setWalletNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState('Unknown');
  const [errorText, setErrorText] = useState('Waiting on user...');
  const [selectedChainId, setSelectedChainId] = useState('');
  const [account, setAccount] = useState(null)

  const connectWallet = async () => {
    setErrorText('stand by...')
    if (window.ethereum) {
      try {

        // Fetch accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0])
    
        setWalletStatus('Connected ' + accounts[0]);
        updateCurrentNetwork()        
      } catch (error) {
        setErrorText(`Error ${error.code}: ` + error.message)
        console.error('Error connecting wallet:', error);
      }
    } else {
      setErrorText("MetaMask is not available in your browser's window.ethereum object.");
      console.error("MetaMask is not available in your browser's window.ethereum object.");
    }
  };

  const updateCurrentNetwork = async () => {
    if (window.ethereum) {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      const net = getMatchingNetwork(chainId)
      setCurrentNetwork(`${net.name} - ${net.chainId}`);
    }
  };

    
  async function switchEthereumNetwork(chainId) {
    const net = getMatchingNetwork(chainId)
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: encodeChainIdHex(chainId) }],
        });

        setCurrentNetwork(`Switched to ${net.name} (${net.chainId})`);
      } catch (error) {
        setCurrentNetwork(`Error switching network... adding"`);
        addSelectedNetwork(chainId);
      }
    } else {
      console.error("MetaMask is not available in your browser's window.ethereum object.");
    }
  }
  
  const addSelectedNetwork = async (id) => {
    setErrorText('stand by...')
    const net = getMatchingNetwork(id)
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: encodeChainIdHex(net.chainId), // Binance Smart Chain ID 56
              chainName: net.name,
              nativeCurrency: {
                name: net.symbol,
                symbol: net.symbol,
                decimals: 18,
              },
              rpcUrls: net.rpcUrls, // BSC RPC URL
              blockExplorerUrls: net.explorers, // BSC Explorer URL
            },
          ],
        });
        // setWalletNetworks([...walletNetworks, 'Binance Smart Chain']);
        setCurrentNetwork(net.name);
      } catch (error) {
        setErrorText('Error adding ' + net.name + ": " + JSON.stringify(error))
      }
    } else {
      setErrorText("MetaMask is not available in your browser's window.ethereum object.");
    }
  };

  const networkOptions = [
    { name: 'Ethereum Mainnet', chainId: 1, symbol: 'ETH', rpcUrls: ['https://mainnet.infura.io/v3/'], explorers: ['https://etherscan.io'] },
    { name: 'Binance Smart Chain', chainId: 56, symbol: 'BNB', rpcUrls: ['https://bsc-dataseed.binance.org'], explorers: ['https://bscscan.com'] },
    { name: 'PulseChain', chainId: 369, symbol: 'PLS', rpcUrls: ['https://rpc.pulsechain.com'], explorers: ['https://otter.pulsechain.com'] },
    { name: 'Hardhat', chainId: 31337, symbol: 'ETH', rpcUrls: ['http://127.0.0.1:8545'], explorers: null },
  ];

  const encodeChainIdHex = (id) => {
    return '0x' + Number(id).toString(16)
  }

  const getMatchingNetwork = (id) => {
    for(var n = 0; n < networkOptions.length; n++){
      if(Number(id) === networkOptions[n].chainId){
        return networkOptions[n];
      }
    }
    return networkOptions[0];
  }

  const handleNetworkChange = (event) => {
    const selectedId = event.target.value;
    setSelectedChainId(selectedId);
    switchEthereumNetwork(selectedId);
  };

  return (
    <div className="App">
      <Navbar />

      <Button onClick={connectWallet} label="Connect Wallet" />
      <br />
      <MainDisplay
        walletStatus={walletStatus}
        errorText={errorText}
      />
      <div>
        <span>
          <select onChange={handleNetworkChange}>
            <option value="">Select Network</option>
            {networkOptions.map((network) => (
              <option key={network.chainId} value={network.chainId}>
                {network.name}
              </option>
            ))}
          </select>
        </span>
      </div>
      
      <div style={{marginTop: "10px"}}>Current Network Selection: <b>{currentNetwork}</b></div>
      <br />
    </div>
  );
}

export default App;
