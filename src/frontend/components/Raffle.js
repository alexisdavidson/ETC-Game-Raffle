import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Raffle = ({id, name}) => {
    const [slots, setSlots] = useState([])

    const enterRaffle = async(slotId) => {
        console.log("Enter Raffle " + id + " for slot " + slotId)
    }


    const loadSlots = async() => {
        let slotsTemp = [
            { address: "0xd71e736a7ef7a9564528d41c5c656c46c18a2aed" },
            { address: "0xd71e736a7ef7a9564528d41c5c656c46c18a2aed" },
            { address: "0xd71e736a7ef7a9564528d41c5c656c46c18a2aed" },
            { address: "0xd71e736a7ef7a9564528d41c5c656c46c18a2aed" },
            { address: "0xd71e736a7ef7a9564528d41c5c656c46c18a2aed" },
            { address: "" },
            { address: "" },
            { address: "" },
            { address: "" },
            { address: "" },
            { address: "" },
        ]

        setSlots(slotsTemp)
    }

    useEffect(() => {
        loadSlots()
    }, [])

    return (
        <Col className="mx-auto overflow-hidden">
            <Row>
                <Card bg="dark mb-2">
                    <Card.Header>{name}</Card.Header>
                </Card>
                <Card bg="dark">
                    <Card.Body color="secondary">
                        <Card.Text>
                            {slots.map((item, idx) => (
                                item.address != "" ? (
                                    <Button key={idx} className="mb-2 slot slotTaken py-1" variant="success" size="lg">
                                        {item.address.slice(0, 10) + '...' + item.address.slice(32, 42)}
                                    </Button>
                                ) : (
                                    <Button key={idx} className="mb-2 slot py-1" variant="success" size="lg" onClick={() => enterRaffle(idx)}>
                                        Click to Enter {name}
                                    </Button>
                                )
                            ))}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Row>
            <Row className="mt-2">
                <Col>Last Winner: 0xd71e736a7ef7a9564528d41c5c656c46c18a2aed</Col>
            </Row>
        </Col>
    );
}
export default Raffle