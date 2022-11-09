import React from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { ethers } from 'ethers'
import tokenLogo from '../img/token-logo.png'
import ethLogo from '../img/eth-logo.png'
import { useState } from 'react'

const toWei = (num) => ethers.utils.parseEther(num.toString())

const BuyForm = ({buyTokens, ethBalance, tokenBalance, showTransactionMessage, feePercentDeposit, rate}) => {
    const [output, setOutput] = useState(0)
    const [input, setInput] = useState(0)
    
    return (
        <Form className="mb-3" onSubmit={(event) => {
            event.preventDefault()
            let etherAmount = input.value.toString()
            etherAmount = toWei(etherAmount, 'ether')
            showTransactionMessage()
            buyTokens(etherAmount)
        }}>
            <div style={{textAlign:"left"}}>
                Balance: {ethBalance}
            </div>
            <InputGroup className="mb-4">
                <Form.Control
                    placeholder="0"
                    aria-label="Eth Amount"
                    onChange={(event) => {
                        const etherAmount = input.value.toString()
                        const feeFactor = Math.floor(parseInt(feePercentDeposit)) / 1000.0
                        setOutput(etherAmount * rate - (feeFactor * etherAmount * rate ))
                        console.log(output)
                    }}
                    ref={(input) => { setInput(input) }}
                    className="form-control form-control-lg"
                    required 
                    aria-describedby="basic-addon2"
                />
                <InputGroup.Text id="basic-addon2">
                    <img src={ethLogo} height='32' alt="" />
                    &nbsp;&nbsp;&nbsp; MATIC
                </InputGroup.Text>
            </InputGroup>
            <div style={{textAlign:"left"}}>
                Balance: {tokenBalance}
            </div>
            <InputGroup className="mb-2">
                <Form.Control
                    placeholder="0"
                    className="form-control form-control-lg"
                    value={output}
                    disabled
                />
                <InputGroup.Text id="basic-addon2">
                    <img src={tokenLogo} height='32' alt="" />
                    &nbsp;&nbsp;&nbsp; CSN
                </InputGroup.Text>
            </InputGroup>
            <div className="mb-5">
                1 MATIC = {rate} CSN
            </div>
            <Button type="submit" variant="primary" className="btn-block btn-lg">Swap</Button>
        </Form>
      );
}

export default BuyForm;