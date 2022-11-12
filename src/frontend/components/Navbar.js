import {
    Link
} from "react-router-dom";

import { Navbar, Nav, Button, Container } from 'react-bootstrap'
import { useEffect } from 'react'
import tokenLogo from '../img/token-logo.png'

const Navigation = ({ web3Handler, account }) => {

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    {/* <img src={media} width="40" height="40" className="" alt="" /> */}
                    &nbsp; ETC Raffle
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4 p-0">
                                <Button variant="outline-light">
                                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                                </Button>

                            </Nav.Link>
                        ) : (
                            <Button onClick={web3Handler} variant="outline-light">Connect Wallet</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;