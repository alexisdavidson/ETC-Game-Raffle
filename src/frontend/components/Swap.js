import React from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import BuyForm from './BuyForm'
import SellForm from './SellForm'
import { useState } from 'react'
import { ethers } from 'ethers'
import { useEffect } from 'react'

const fromWei = (num) => ethers.utils.formatEther(num)

const Swap = ({ethBalance, tokenBalance, house, token, account}) => {
    const [currentForm, setCurrentForm] = useState('buy')
    const [showingTransactionMessage, setShowingTransactionMessage] = useState(false)
    const [error, setError] = useState(null)
    const [feePercentWithdraw, setFeePercentWithdraw] = useState(1)
    const [feePercentDeposit, setFeePercentDeposit] = useState(1)
    const [rate, setRate] = useState(1)

    const buyTokens = async (etherAmount) => {
        setError(null)
        await house.buyTokens({ value: etherAmount, from: account })
        .catch(error => {
            console.error("Custom error handling: " + error?.data?.message);
            setError(error?.data?.message)
        });
      }
    
      const sellTokens = async (tokenAmount) => {
        setError(null)
        await token.approveUnlimited(account);
        await house.sellTokens(tokenAmount)
        .catch(error => {
            console.error("Custom error handling: " + error?.data?.message);
            setError(error?.data?.message)
        });
      }

    const showTransactionMessage = () => {
        setShowingTransactionMessage(true)
    }

    const loadFees = async () => {
        setFeePercentWithdraw((await house.getFeePercentWithdraw()).toString())
        setFeePercentDeposit((await house.getFeePercentDeposit()).toString())
        setRate((await house.getRate()).toString())
    }

    useEffect(() => {
        loadFees()
    }, [])

    let content
    if (currentForm === 'buy') {
        content = <BuyForm 
                        ethBalance={ethBalance}
                        tokenBalance={tokenBalance}
                        buyTokens={buyTokens}
                        showTransactionMessage={showTransactionMessage}
                        feePercentDeposit={feePercentDeposit}
                        rate={parseInt(rate)}
                    />
    } else if (currentForm === 'sell') {
        content = <SellForm
                        ethBalance={ethBalance}
                        tokenBalance={tokenBalance}
                        sellTokens={sellTokens}
                        showTransactionMessage={showTransactionMessage}
                        feePercentWithdraw={feePercentWithdraw}
                        rate={parseInt(rate)}
                    />
    }

    return (
        <div className="container-fluid mt-5">
            {error ? (
                <div>
                    <p className='mx-3 my-0' style={{color: "red"}}>{error}</p>
                </div>
            ) : (
                showingTransactionMessage ? (
                    <div>
                        <p className='mx-3 my-0'>Please follow the instructions on your wallet. The transaction may take few minutes to complete.</p>
                    </div>
                ) : (
                    <Row className="m-auto" style={{ maxWidth: '600px', background: "black" }}>
                        <Col className="col-4 mx-auto mb-4">
                            <button 
                                className="btn btn-light"
                                onClick={(event) => { setCurrentForm('buy') }}
                            >
                                Buy
                            </button>
                            <span className="text-muted">&lt; &nbsp; &gt;</span>
                            <button className="btn btn-light"
                                onClick={(event) => { setCurrentForm('sell') }}
                            >
                                Sell
                            </button>
                        </Col>
    
                        <Card className="mb-4" bg="dark">
                            <Card.Body>
                                {content}
                                <Row style={{color:"gray"}}>Please connect to the Polygon MATIC network with your wallet in order to house.</Row>
                            </Card.Body>
                        </Card>
                    </Row>
                )
            )}
        </div>
    );
}

export default Swap;