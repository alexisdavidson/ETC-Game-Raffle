import React from 'react'
import { Row, Form, Col, Card, Button } from 'react-bootstrap'
import { ethers } from 'ethers'
import { useState } from 'react'

const Admin = ({house, account, houseBalance}) => {
  const [error, setError] = useState(null)

  const withdrawBalance = async () => {
    setError(null)
    await house.withdraw({ from: account })
    .catch(error => {
        console.error("Custom error handling: " + error?.data?.message);
        setError(error?.data?.message)
    });
  }

  return (
      <div className="container-fluid mt-5">
        {error ? (
            <div>
                <p className='mx-3 my-0' style={{color: "red"}}>{error}</p>
            </div>
        ) : (
          <Row className="m-auto" style={{ maxWidth: '600px', background: "black" }}>
            <Col className="col-4 mx-auto mb-5">
                House balance (MATIC): {houseBalance} 
            </Col>

            <Card className="mb-4" bg="dark">
                <Card.Body>
                    <Form className="my-3" onSubmit={(event) => {
                        event.preventDefault()
                        withdrawBalance()
                    }}>
                    <Button type="submit" variant="primary" className="btn-block btn-lg">Withdraw</Button></Form>
                </Card.Body>
            </Card>
          </Row>
        )}
      </div>
    );
}

export default Admin;