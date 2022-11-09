import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';
import Swap from './Swap';
import Admin from './Admin';
import CoinFlip from './games/CoinFlip';

import { useState } from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'react-bootstrap'
import { useEffect } from 'react'

import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'
import HouseAbi from '../contractsData/House.json'
import HouseAddress from '../contractsData/House-address.json'
import CoinFlipAbi from '../contractsData/CoinFlip.json'
import CoinFlipAddress from '../contractsData/CoinFlip-address.json'

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

function App() {
  const [loading, setLoading] = useState("Awaiting MetaMask Connection...")
  const [account, setAccount] = useState(null)
  const [house, setHouse] = useState({})
  const [token, setToken] = useState({})
  const [coinflip, setCoinFlip] = useState({})
  const [ethBalance, setEthBalance] = useState("0")
  const [tokenBalance, setTokenBalance] = useState("0")
  const [houseBalance, setHouseBalance] = useState("0")

  const GET_BALANCE_INTERVAL_MS = 5000;
  let provider;
  let interval;

    useEffect(() => {
      return () => clearInterval(interval); // unmount function prevents memory leaks
    }, [])

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()

    const _token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
    const _house = new ethers.Contract(HouseAddress.address, HouseAbi.abi, signer)
    const _coinflip = new ethers.Contract(CoinFlipAddress.address, CoinFlipAbi.abi, signer)

    getPlayerBalance(_token, accounts[0])
    setEthBalance(fromWei(await provider.getBalance(accounts[0])).toString())
    setHouseBalance(fromWei(await provider.getBalance(_house.address)).toString())
    setToken(_token)
    setHouse(_house)
    setCoinFlip(_coinflip)
    setLoading("")

    interval = setInterval(() => {
        getPlayerBalance(_token, accounts[0])
    }, GET_BALANCE_INTERVAL_MS);
  }

  const getPlayerBalance = async (_token, _account) => {
    if (_token != null && _account != null) {
      const playerBalance = fromWei(await _token.balanceOf(_account)).toString()
      console.log("getPlayerBalance: " + playerBalance)
      setTokenBalance(playerBalance)
      return playerBalance
    }
    console.log("getPlayerBalance null: " + _token + ", " + _account)
    return ""
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} tokenBalance={tokenBalance} account={account} getPlayerBalance={getPlayerBalance} />
        { loading.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>{loading}</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Home />
            } />
            <Route path="/swap" element={
              <Swap 
                ethBalance={ethBalance}
                tokenBalance={tokenBalance}
                house={house}
                token={token}
                account={account}
              />
            } />
            <Route path="/admin" element={
              <Admin houseBalance={houseBalance} house={house} account={account}/>
            } />
            <Route path="/coinflip" element={
              <CoinFlip coinflip={coinflip}/>
            } />
          </Routes>
        ) }
      </div>
    </BrowserRouter>
  );
}

export default App;
