import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Home = () => {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    let navigate = useNavigate(); 

    const createItems = () => {
        let item = {
            name: "Coin Flip",
            description: "Double your coins!",
            image: coinflipImage,
            path: "/coinflip"
        }

        if (items.length == 0) {
            items.push(item)
        }

        setLoading(false)
    }

    const play = (item) => {
        navigate(item.path);
    }

    useEffect(() => {
        createItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            <div className="px-5 container">
            </div>

            {items.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {items.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card bg="dark">
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body>
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                            {item.description}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => play(item)} variant="primary" size="lg">
                                                Play
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            : (
                <main style={{ padding: "1rem 0" }}>
                    <h2>No listed games</h2>
                </main>
            )}
        </div>
    );
}
export default Home