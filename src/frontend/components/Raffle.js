import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Raffle = ({id, name}) => {

    const enterRaffle = async(slotId) => {
        console.log("Enter Raffle " + id + " for slot " + slotId)
    }

    return (
        <Col className="mx-auto overflow-hidden">
            <Card bg="dark mb-2">
                <Card.Header>{name}</Card.Header>
            </Card>
            <Card bg="dark">
                <Card.Body color="secondary">
                    <Card.Text>
                        <Button className="mb-2" variant="success" size="lg" onClick={() => enterRaffle(1)}>
                            Click to Enter {name}
                        </Button>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Col>
    );
}
export default Raffle