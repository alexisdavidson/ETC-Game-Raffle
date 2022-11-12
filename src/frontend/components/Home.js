import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'
import Raffle from './Raffle';

const Home = ({loading}) => {
    return (
        <div className="flex justify-center">
            <div className="px-5 container mb-3">
                The Winner of a raffle is determined as soon as all slots are sold out.
            </div>
            <div className="px-5 container">
            {!loading ? (
                <Row xs={1} md={2} lg={4} className="g-4 pb-5 pt-3">
                    <Raffle id={0} name={"20M"}/>
                    <Raffle id={1} name={"50M"}/>
                    <Raffle id={2} name={"200M"}/>
                </Row>
            ) : (
                <div>Loading...</div>
            )}
            </div>
        </div>
    );
}
export default Home