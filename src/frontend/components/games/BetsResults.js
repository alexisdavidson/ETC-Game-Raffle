import { Col, Button } from 'react-bootstrap'

const BetsResults = ({betsSettled, playBet, tokenLogo}) => {
    return (
        <div>
            {betsSettled.length > 0 ? (
                <div><h3>Results</h3></div>
            ) : ( <div></div> )}
            
            {betsSettled.map((bet) => (
                <div style={{fontSize: "20px"}} className="my-3">
                    <img src={tokenLogo} height='28' alt="" className="mx-2"/> 
                    {bet.result ? (
                        <span>
                            +{bet.amount}!
                            <br/><Button onClick={() => playBet(bet.amount)} variant="success" size="lg" className="p-1 mt-2" style={{fontSize: "15px"}}>
                                Double or Nothing!
                            </Button>
                        </span>
                    ) : (
                        <span>-{bet.amount}</span>
                    )}
                </div>
            ))}
        </div>
    );
}
export default BetsResults