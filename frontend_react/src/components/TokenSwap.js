import React, { useState, } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import ToastBar from './Toast';
// Styles
import { Wrapper } from './Projects.styles';

import { ethers } from 'ethers';
import wrapperTokenABI from '../contracts_hardhat/artifacts/contracts/WrapperToken.sol/WrapperToken.json';
import TokenABI from '../contracts_hardhat/artifacts/contracts/Token.sol/Token.json';

import { MantineProvider } from '@mantine/core';
import { NotificationsProvider, showNotification, cleanNotifications  } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';

const wrapperTokenAddress = "0x5d2AF5fc60DA2e7B1754B6A3Cd4b302359e83adB";
const BiLiraAddress = "0x71B2a76e5cd9E58Df893B39c9Fb10C2CB632aB5F";


const TokenSwap = () => {

    const [tokens, setTokens] = useState(["SUCoin", "BiLira"])
    const [amount, setAmount] = useState();

    const [toastShow, setToastshow] = useState(false);
    const [toastText, setToasttext] = useState();
    const [toastHeader, setToastheader] = useState();

    const swapTokens = async () => {
        console.log(amount)
        if (tokens[0] === "BiLira") {
            action1()
        } else { action2() }
    }

    const action1 = async () => {
        try {

            const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider());
            const signer = await provider.getSigner();

            const value = ethers.utils.parseUnits(amount, 18);

            var BiLiraContract = await new ethers.Contract(BiLiraAddress, TokenABI.abi, signer);
            var SUCoinContract = await new ethers.Contract(wrapperTokenAddress, wrapperTokenABI.abi, signer);

            //console.log("done", ethers.parseUnits(value, "gwei"))
            //setToastshow(true)
            //setToastheader("Signing the Transaction")
            //setToasttext("Please sign the transaction from your wallet.")
            showNotification({
                title: 'Signing the Transaction',
                message: 'Please sign the transaction from your wallet.',
                loading: true,
                autoClose: false,
            })



            var approveTx = await BiLiraContract.approve(wrapperTokenAddress, value);

            cleanNotifications();

            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Pending Transaction")
            //setToasttext("Waiting for transaction confirmation.")
            showNotification({
                title: 'Pending Transaction',
                message: 'Waiting for transaction confirmation.',
                loading: true,
                autoClose: false,
            })

            let receipt = await approveTx.wait(1);

            cleanNotifications();

            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Signing the Transaction");
            //setToasttext("Please sign the transaction from your wallet.");
            showNotification({
                title: 'Signing the Transaction',
                message: 'Please sign the transaction from your wallet.',
                loading: true,
                autoClose: false,
            })

            var buyTx = await SUCoinContract.depositFor(await signer.getAddress(), value);

            cleanNotifications();

            //setToastshow(false);
            //setToastshow(true);
            //setToastheader("Pending Transaction");
            //setToasttext("Waiting for transaction confirmation.");
            showNotification({
                title: 'Pending Transaction',
                message: 'Waiting for transaction confirmation.',
                loading: true,
                autoClose: false,
            })

            receipt = await buyTx.wait(1);

            cleanNotifications();

            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Success")
            //setToasttext("Succesfuly bought %s SUCoin." + amount);
            showNotification({
                title: 'Success',
                message: `Succesfuly bought ${amount} SUCoin.`,
                icon: <IconCheck size={16} />,
                color: "teal",
                autoClose: false,
            })
            console.log("done", receipt)
            //sleep(1000);
            //setToastshow(false);
        } catch (error) {
            console.log(error)
            console.log(typeof(error))
            console.log(error.reason)

            cleanNotifications();

            showNotification({
                title: 'Error Occured!',
                message: error.reason.charAt(0).toUpperCase() + error.reason.substring(1), 
                icon: <IconX  size={16} />,
                color: "red",
                autoClose: false,
            })

            return false;
        }
    }

    const action2 = async () => {
        try {
            const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider());
            const signer = await provider.getSigner();

            var SUCoinContract = await new ethers.Contract(wrapperTokenAddress, wrapperTokenABI.abi, signer);

            const value = ethers.utils.parseUnits(amount, 18);

            //setToastshow(true)
            //setToastheader("Signing the Transaction")
            //setToasttext("Please sign the transaction from your wallet.")
            showNotification({
                title: 'Signing the Transaction',
                message: 'Please sign the transaction from your wallet.',
                loading: true,
                autoClose: false,
            })

            var sellTx = await SUCoinContract.withdrawTo(await signer.getAddress(), value);

            cleanNotifications();

            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Pending Transaction")
            //setToasttext("Waiting for transaction confirmation.")
            showNotification({
                title: 'Pending Transaction',
                message: 'Waiting for transaction confirmation.',
                loading: true,
                autoClose: false,
            })

            await sellTx.wait(1);

            cleanNotifications();

            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Success")
            //setToasttext("Succesfuly swapped %s SUCoin to %s BiLira." + value);
            showNotification({
                title: 'Success',
                message: `Succesfuly swapped ${value} SUCoin to %s BiLira.`,
                icon: <IconCheck size={16} />,
                color: "teal",
                autoClose: false,
            })

            //sleep(1000);
            //setToastshow(false);
        } catch (error) {
            console.log(error)
            console.log(typeof(error))
            console.log(error.reason)

            cleanNotifications();

            showNotification({
                title: 'Error Occured!',
                message: error.reason.charAt(0).toUpperCase() + error.reason.substring(1), 
                icon: <IconX  size={16} />,
                color: "red",
                autoClose: false,
            })

            return false;
        }
    }

    const changeAsset = async () => {
        setTokens([tokens[1], tokens[0]])
        //asset == "SUCoin" ? setAsset("BiLira") : setAsset("SUCoin");
    }

    const handleInput = e => {
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;

        if (name === 'amount') setAmount(value);
        if (name === 'amount2') setAmount(value);

        console.log("amm", amount)
    };

    return (
        <>
            <MantineProvider withNormalizeCSS withGlobalStyles>
                <NotificationsProvider position="bottom-center">
                    <div className={'swap-page'}>
                        <div className="sectionName" style={{ paddingLeft: "50px", paddingTop: "25px", paddingBottom: "25px" }}>Swap Token</div>
                        <ToastBar toastText={toastText} toastHeader={toastHeader} toastShow={toastShow} setToastshow={setToastshow}></ToastBar>
                        <Wrapper>

                            <Container  >
                                <Row className="g-2">
                                    <Col md>
                                        <FloatingLabel controlId="floatingInputGrid" label={tokens[0]} style={{ fontFamily: 'Montserrat' }}>
                                            <Form.Control onChange={handleInput} name="amount" type="text" value={amount} style={{ fontFamily: 'Montserrat' }} />
                                        </FloatingLabel>
                                    </Col>
                                </Row >

                                <div style={{
                                    justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "30px", marginLeft: "70px"
                                }}>
                                    < Button variant="dark" onClick={() => changeAsset()}>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-arrow-down-up" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z" />
                                        </svg>

                                    </Button>
                                </div>

                                <Row className="g-2">
                                    <Col md>
                                        <FloatingLabel controlId="floatingInputGrid" label={tokens[1]} style={{ fontFamily: 'Montserrat' }}>
                                            <Form.Control onChange={handleInput} name="amount2" type="text" value={amount} style={{ fontFamily: 'Montserrat' }} />
                                        </FloatingLabel>
                                    </Col>
                                </Row >

                                <br></br>
                                <Row style={{ justifyContent: "center", alignItems: "center" }}>
                                    <Col style={{ justifyContent: "center", alignItems: "center", width: "60%" }}>
                                        <Button style={{ justifyContent: "center", alignItems: "center", width: "100%", fontFamily: 'Montserrat', }} variant="dark" onClick={() => { swapTokens() }}> Swap</Button>
                                    </Col>

                                </Row>
                            </Container>
                        </Wrapper >
                    </div>
                </NotificationsProvider>
            </MantineProvider>
        </>
    );
};



export default TokenSwap;