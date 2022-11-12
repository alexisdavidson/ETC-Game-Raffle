import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';

import { useState } from 'react'
import { ethers } from 'ethers'
import { useEffect } from 'react'

import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
  }

  const loadContracts = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const _token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
    setLoading(false)
  }

  useEffect(() => {
    loadContracts()
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />

          <Routes>
            <Route path="/" element={
              <Home loading={loading} />
            } />
            {/*
            <Route path="/coinflip" element={
              <CoinFlip coinflip={coinflip}/>
            } /> */}
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
