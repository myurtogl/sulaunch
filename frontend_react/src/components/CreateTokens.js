import React, { useState } from "react";
import { useLocation } from "react-router-dom";

// Components
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
// Styles

import { ethers } from "ethers";
import { numberToFixedNumber } from "../helpers";
import Maestro from "../contracts_hardhat/artifacts/contracts/Maestro.sol/Maestro.json";

import { MantineProvider } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { MaestroAddress } from "../config";

const maestro = { address: MaestroAddress };

const CreateTokens = () => {
  const hash = useLocation()?.state?.hash;
  console.log(hash);

  const [tokenName, setTokenName] = useState();
  const [tokenSymbol, setTokenSymbol] = useState();
  const [totalSupply, setTotalSupply] = useState();

  const [toastShow, setToastshow] = useState(false);
  const [toastText, setToasttext] = useState();
  const [toastHeader, setToastheader] = useState();

  const action1 = async () => {
    try {
      const decimals = 18;
      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();
      const signer = await provider.getSigner();

      const totalSupplyDecimals = numberToFixedNumber(totalSupply, decimals);

      let MAESTRO = new ethers.Contract(maestro.address, Maestro.abi, signer);

      console.log(MAESTRO);

      //setToastshow(true)
      //setToastheader("Signing the Transaction")
      //setToasttext("Please sign the transaction from your wallet.")
      cleanNotifications();

      showNotification({
        title: "Signing the Transaction",
        message: "Please sign the transaction from your wallet.",
        loading: true,
        autoClose: false,
      });

      const tokenProxy = await MAESTRO.createToken(
        hash,
        tokenName,
        tokenSymbol,
        totalSupplyDecimals
      );

      //setToastshow(false)
      //setToastshow(true)
      //setToastheader("Pending Transaction")
      //setToasttext("Waiting for transaction confirmation.")
      cleanNotifications();

      /*showNotification({
                title: 'Pending Transaction',
                message: 'Waiting for transaction confirmation.',
                loading: true,
                autoClose: false,
            })*/

      console.log("Your token deployed on address: %s", tokenProxy.address);

      showNotification({
        title: "Token Creation Successful",
        message: `Your token has deployed on the Blockchain.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });

      //setToastshow(false);
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

    if (name === "tokenName") setTokenName(value);
    if (name === "tokenSymbol") setTokenSymbol(value);
    if (name === "totalSupply") setTotalSupply(value);
  };

  return (
    <>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <NotificationsProvider position="bottom-center">
          <div className="create-tokens-page">
            {!hash ? (
              "Please enter from project details page"
            ) : (
              <div className="create-token-form">
                <FloatingLabel
                  controlId="floatingInputGrid"
                  label="Token Name"
                  style={{ fontFamily: "Montserrat" }}>
                  <Form.Control
                    onChange={handleInput}
                    name="tokenName"
                    type="text"
                    style={{ fontFamily: "Montserrat" }}
                  />
                </FloatingLabel>
                <FloatingLabel
                  controlId="floatingInputGrid"
                  label="Token Symbol"
                  style={{ fontFamily: "Montserrat" }}>
                  <Form.Control
                    onChange={handleInput}
                    name="tokenSymbol"
                    type="text"
                    style={{ fontFamily: "Montserrat" }}
                  />
                </FloatingLabel>
                <FloatingLabel
                  controlId="floatingInputGrid"
                  label="Total Supply"
                  style={{ fontFamily: "Montserrat" }}>
                  <Form.Control
                    onChange={handleInput}
                    name="totalSupply"
                    type="text"
                    style={{ fontFamily: "Montserrat" }}
                  />
                </FloatingLabel>

                <br />
                <button
                  className="create-token-button"
                  onClick={() => {
                    action1();
                  }}>
                  Create Tokens
                </button>
              </div>
            )}
          </div>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

export default CreateTokens;
