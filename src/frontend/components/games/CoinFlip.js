import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button, Spinner } from 'react-bootstrap'
import tokenLogo from '../../img/token-logo.png'
import BetsResults from './BetsResults';

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

const CoinFlip = ({coinflip}) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [bet, setBet] = useState(1)
    const [betPending, setBetPending] = useState(false)
    const [betsPlaced, setBetsPlaced] = useState([])
    const [betsSettled, setBetsSettled] = useState([])
    let betsPlacedVar = []
    let betsSettledVar = []
    const betsSelection = [1, 5, 10, 50, 100, 500]

    const play = async () => {
        playBet(bet)
    }
    
    const playBet = async (_bet) => {
        setError(null)
        console.log("Play with bet " + _bet)
        await coinflip.play(toWei(_bet))
        .catch(error => {
            console.error("Custom error handling: " + error?.data?.message);
            setError(error?.data?.message)
        }).then(
            setBetPending(true)
        )
    }

    const listenToEvents = async () => {
        coinflip.on("BetStarted", (user, amount, id) => {
            console.log("BetStarted");
            console.log(user, fromWei(amount), id);

            betsPlacedVar = [...betsPlacedVar, {amount: parseInt(fromWei(amount)), id: id.toString()}]
            setBetsPlaced(betsPlacedVar)
        });

        coinflip.on("BetSettled", (user, amount, result, id) => {
            console.log("BetSettled");
            console.log(user, fromWei(amount), result.toString() == 1, id.toString());
            
            betsSettledVar = [...betsSettledVar, {amount: parseInt(fromWei(amount)), result: result.toString() == 1}]
            setBetsSettled(betsSettledVar)

            console.log("betsPlacedVar before slice")
            console.log(betsPlacedVar)
            // Remove bet from betsPlaced list
            for(let i = 0; i < betsPlacedVar.length; i ++) {
                if (betsPlacedVar[i].id == id) {
                    betsPlacedVar.splice(i, 1);
                    break;
                }
            }
            
            console.log("betsPlacedVar after slice")
            console.log(betsPlacedVar)

            setBetsPlaced(betsPlacedVar)
            setBetPending(betsPlacedVar.length > 0)
        });
    }

    const loadGame = () => {
        setLoading(false)
    }

    useEffect(() => {
        loadGame()
        listenToEvents()

        return () => {
          coinflip.removeAllListeners("BetStarted");
          coinflip.removeAllListeners("BetSettled");
        };
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="container-fluid mt-4">
            <Row className="m-auto">
                <Col className="d-none d-lg-block">
                    <BetsResults betsSettled={betsSettled} playBet={playBet} tokenLogo={tokenLogo}/>
                </Col>
                <Col className="mb-4 mx-auto col-12 col-lg-6 col-xl-6">
                    <h1>Coin Flip</h1>
                    <img src={tokenLogo} alt="" className="coinButton mt-4" onClick={() => play()}/>

                    <Row xs={1} md={2} lg={4} className="g-4 py-5 mx-auto">
                        <p style={{width: "100%"}}>Select the amount to bet and click on the coin to play!</p>
                    </Row>

                    <Row xs={1} md={2} lg={4} className="g-4 mx-auto" style={{justifyContent: "center"}}>
                        {betsSelection.map((betAmount, i) => (
                            <>
                                {bet == betAmount ? 
                                    <input type="radio" class="btn-check" name="options" id={"option"+i} autocomplete="off" checked />
                                : 
                                    <input type="radio" class="btn-check" name="options" id={"option"+i} autocomplete="off" />
                                } 
                                <label style={{width:"75px", borderRadius: "0px"}} class="btn btn-secondary" for={"option"+i} onClick={() => setBet(betAmount)}>{betAmount}</label>
                            </>
                        ))}
                    </Row>

                    <Row xs={1} md={2} lg={4} className="mx-auto">
                        {error != null ? (
                            <p style={{width: "100%", color: "red"}}>
                                {error}
                            </p>
                        ) : (
                            <div></div>
                        )}
                    </Row>
                </Col>
                <Col className="d-md-block d-lg-none">
                    <BetsResults betsSettled={betsSettled} playBet={playBet} tokenLogo={tokenLogo}/>
                </Col>
                <Col className="col-lg-3">
                    {betPending || betsPlaced.length > 0 ? (
                        <div><h3>Pending... <Spinner animation="border" style={{width: "20px", height:"20px"}} /></h3></div>
                    ) : (
                        <div></div>
                    )}
                    
                    {betsPlaced.map((bet) => (
                        <div style={{fontSize: "20px"}}>
                            <img src={tokenLogo} height='28' alt="" className="mx-2"/> {bet.amount}
                        </div>
                    ))}
                </Col>
            </Row>
        </div>
    );
}
export default CoinFlip