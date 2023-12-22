import React, { useState } from "react";
import { useLocation } from "react-router-dom";
// Components
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Col";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import { backendUrl } from "../config";
import Cookies from "js-cookie";
import LoadingButton from "./LoadingButton";

import Maestro from "../contracts_hardhat/artifacts/contracts/Maestro.sol/Maestro.json";

import { ethers } from "ethers";

import { numberToFixedNumber } from "../helpers";

import { MantineProvider } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";

import { MaestroAddress } from "../config";

const BiLiraAddress = "0x71B2a76e5cd9E58Df893B39c9Fb10C2CB632aB5F";

const maestro = { address: MaestroAddress };

const CreateAuction = () => {
  const hash = useLocation()?.state?.hash;
  const projectId = useLocation()?.state?.id;

  console.log(hash, projectId);

  const [isLoading, setLoading] = useState(false);
  const [auctionTypes, setAuctiontypes] = useState([
    {
      id: 0,
      name: "Uncapped Auction",
      description: "Fixed price unlimited tokens only need the first parameter",
      fields: ["tokenPrice"],
    },
    {
      id: 1,
      name: "Pseudo Capped Auction",
      description:
        "Fixed number of tokens but unlimited sucoins can be invested which will be distributed in the end burns all tokens if no one invests",
      fields: ["TokensToBeDesitributed", "limit"],
    },
    {
      id: 2,
      name: "Order book FCFS Auction",
      description:
        "FCFS Auction where users get their tokens at the end of auction",
      fields: ["tokenPrice", "TokensToBeDesitributed", "limit"],
    },
    {
      id: 3,
      name: "FCFS Auction",
      description:
        "First come first serve, fixed price fixed supply token sale",
      fields: ["tokenPrice", "TokensToBeDesitributed"],
    },
    {
      id: 4,
      name: "Dutch Auction",
      description:
        "Fixed supply token auction with price going down to finalPrice linearly over the duration last parameter is ignored",
      fields: ["tokenPrice", "finalPrice", "TokensToBeDesitributed"],
    },
    {
      id: 5,
      name: "Orderbook Dutch Auction",
      description:
        "Investors can bid their price to tokens, at the end of the auction tokens will be distributed starting from the highest bid until all sold tokens are distributed, price parameters ignored",
      fields: ["TokensToBeDesitributed"],
    },
    {
      id: 6,
      name: "Strict Dutch Auction",
      description:
        "Dutch Auction but supply decreases linearly as well, burns the remaining coins instead of giving them to proposer",
      fields: ["tokenPrice", "finalPrice", "TokensToBeDesitributed"],
    },
  ]);

  const [auction, setAuction] = useState("");
  const [tokenPrice, setTokenPrice] = useState();
  const [finalPrice, setFinalPrice] = useState();
  const [limit, setLimit] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [TokensToBeDesitributed, setTokensToBeDesitributed] = useState();

  const updateDatabase = async () => {
    try {
      console.log("w");

      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .put(`/Project/CreateAuction/${projectId}`)
          .then((res) => {
            console.log("response: ", res.data);
            resolve(res);
          })
          .catch((e) => {
            const err = "Unable to create an auction in database";
            reject(err);
          });
      });
      let result = await response2;
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const deployAuction = async (id) => {
    try {
      const sucoinDecimals = 18; //todo get this value from blockchain
      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();
      const signer = await provider.getSigner();
      const tokenDistributedDecimal = TokensToBeDesitributed
        ? numberToFixedNumber(TokensToBeDesitributed, sucoinDecimals)
        : 0;
      const priceDecimal = tokenPrice
        ? numberToFixedNumber(tokenPrice, sucoinDecimals)
        : 0;
      const limitDecimal = limit
        ? numberToFixedNumber(limit, sucoinDecimals)
        : 0;

      const finalRate = finalPrice
        ? numberToFixedNumber(finalPrice, sucoinDecimals)
        : 0;

      const maestroContract = new ethers.Contract(
        maestro.address,
        Maestro.abi,
        signer
      );

      const auctionType = [
        "UncappedAuction",
        "PseudoCappedAuction",
        "OBFCFSAuction",
        "FCFSAuction",
        "DutchAuction",
        "OBDutchAuction",
        "StrictDutchAuction",
      ][id];

      const tx = await maestroContract.createAuction(hash, auctionType, [
        tokenDistributedDecimal,
        priceDecimal,
        finalRate,
        limitDecimal,
      ]);
      await tx.wait(1);

      cleanNotifications();

      /*showNotification({
                title: 'Pending Transaction',
                message: 'Waiting for transaction confirmation.',
                loading: true,
                autoClose: false,
            })*/

      showNotification({
        title: "Auction Creation is Successful",
        message: `You are ready to start your auction.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });

      console.log("x");
      await updateDatabase();
    } catch (error) {
      //console.log(error)
      //setToastshow(true)
      //setToastheader("Catched an error")
      //setToasttext(error)

      console.log(error);
      console.log(typeof error);
      console.log(error.reason);

      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message:
          error.reason.charAt(0).toUpperCase() + error.reason.substring(1),
        icon: <IconX size={16} />,
        color: "red",
        autoClose: false,
      });

      return false;
    }
  };

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === "tokenPrice") setTokenPrice(value);

    if (name == "finalPrice") setFinalPrice(value);

    if (name == "limit") setLimit(value);

    if (name === "TokensToBeDesitributed") setTokensToBeDesitributed(value);
  };

  return (
    <>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <NotificationsProvider position="bottom-center">
          {projectId && hash ? (
            <div className="create-auction-page">
              <Container>
                {auctionTypes.map((type, index) => (
                  <Col>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey={index}>
                        <Accordion.Header> {type.name} </Accordion.Header>
                        <Accordion.Body>
                          {type.description}
                          <Container>
                            {type.fields.map((field, index) => (
                              <Row className="g-2">
                                <Col md>
                                  <FloatingLabel
                                    controlId="floatingInputGrid"
                                    label={field}
                                    style={{ fontFamily: "Montserrat" }}>
                                    <Form.Control
                                      onChange={handleInput}
                                      name={field}
                                      type="text"
                                      style={{ fontFamily: "Montserrat" }}
                                    />
                                  </FloatingLabel>
                                </Col>
                              </Row>
                            ))}

                            {/*           <Row className="g-2">
                                                    <Col md>
                                                        <FloatingLabel controlId="floatingInputGrid" label="finalPrice">
                                                            <Form.Control onChange={handleInput} name="finalPrice" type="text" />
                                                        </FloatingLabel>
                                                    </Col>
                                                </Row >

                                                
                                               

                                                <Row className="g-2">
                                                    <Col md>
                                                        <FloatingLabel controlId="floatingInputGrid" label="#TokensToBeDesitributed">
                                                            <Form.Control onChange={handleInput} name="TokensToBeDesitributed" type="text" />
                                                        </FloatingLabel>
                                                    </Col>
                                                </Row >
                                                
                                                <Row className="g-2">
                                                    <Col md>
                                                        <FloatingLabel controlId="floatingInputGrid" label="#limit">
                                                            <Form.Control onChange={handleInput} name="limit" type="text" />
                                                        </FloatingLabel>
                                                    </Col>
                                                </Row > */}

                            <br></br>
                          </Container>
                          <LoadingButton
                            show={isLoading}
                            text={"Submit to Chain"}
                            style={{ color: "#173A6A" }}
                            func={() => {
                              deployAuction(index);
                            }}>
                            Deploy Auction{" "}
                          </LoadingButton>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Col>
                ))}
              </Container>{" "}
            </div>
          ) : (
            "Please enter from project details page"
          )}
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

/*

  <Container  >
                    <Row className="g-2">
                        <Col md>
                            <FloatingLabel controlId="floatingInputGrid" label="Var1">
                                <Form.Control onChange={handleInput} name="var1" type="text" />
                            </FloatingLabel>
                        </Col>
                    </Row >

                    <Row className="g-2">
                        <Col md>
                            <FloatingLabel controlId="floatingInputGrid" label="Var2">
                                <Form.Control onChange={handleInput} name="var2" type="text" />
                            </FloatingLabel>
                        </Col>
                    </Row >


                    <br></br>
                    <Row style={{ paddingLeft: "10%" }}>
                        <Col style={{ justifyContent: "center", alignItems: "center" }}>
                            <Button variant="dark" onClick={() => { action1() }}> Action 1</Button>
                        </Col>
                        <Col style={{ justifyContent: "center", alignItems: "center" }}>
                            <Button variant="dark" onClick={() => { action2() }}> Action 2</Button>
                        </Col>
                    </Row>
                </Container>

                */
export default CreateAuction;
