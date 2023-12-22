import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
// Components
// Config
// Image
// Styles
import web3 from "web3";
import Cookies from "js-cookie";

import { ethers } from "ethers";

import { Progress, Rating } from "@mantine/core";

import { Buffer } from "buffer";

import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";

import FCFSAuction from "../../contracts_hardhat/artifacts/contracts/UpgradeableAuctions/FCFSAuction.sol/FCFSAuction.json";

import OBFCFSAuction from "../../contracts_hardhat/artifacts/contracts/UpgradeableAuctions/OBFCFSAuction.sol/OBFCFSAuction.json";

import WrapperToken from "../../contracts_hardhat/artifacts/contracts/WrapperToken.sol/WrapperToken.json";

import { numberToFixedNumber } from "../../helpers";

import { showNotification, cleanNotifications } from "@mantine/notifications";
import { IconX, IconCheck } from "@tabler/icons";
import { SuCoinAddress } from "../../config";

// const BiLiraAddress = "0x71B2a76e5cd9E58Df893B39c9Fb10C2CB632aB5F";
// const maestro = { address: "0x28004d3fFa7b5F2A8aE6F826557E7e25FDe6705b" }
const SUCoin = { address: SuCoinAddress };

const AuctionInfo = ({
  projectImage,
  auction,
  status,
  projectId,
  price,
  tokenDist,
  deposit,
  totalRaise,
  limit,
  startingDate,
  duration,
  endingDate,
  remainingTime,
  auctionType,
  tokenName,
  rating,
  projectName,
  projectDescription,
}) => {
  const [tokens, setTokens] = useState(["SUCoin", "BiLira"]);
  const [amount, setAmount] = useState();
  const [userPrice, setUserPrice] = useState();
  const [logged, setLogged] = useState(false);
  const [account, setAccount] = useState();

  const navigate = useNavigate();

  const isTokenExpired = (token) =>
    Date.now() >=
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).exp *
      1000;

  var auctionMechanism = {
    UncappedAuction:
      "Fixed price unlimited tokens only need the first parameter",
    PseudoCappedAuction:
      "Fixed number of tokens but unlimited sucoins can be invested which will be distributed in the end burns all tokens if no one invests",
    OBFCFSAuction:
      "FCFS Auction where users get their tokens at the end of auction",
    FCFSAuction: "First come first serve, fixed price fixed supply token sale",
    DutchAuction:
      "Fixed supply token auction with price going down to finalPrice linearly over the duration last parameter is ignored",
    OBDutchAuction:
      "Investors can bid their price to tokens, at the end of the auction tokens will be distributed starting from the highest bid until all sold tokens are distributed, price parameters ignored",
    StrictDutchAuction:
      "Dutch Auction but supply decreases linearly as well, burns the remaining coins instead of giving them to proposer",
  };

  useEffect(() => {
    //        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //        setAccount(accounts[0])
    const handleMetamask = async () => {
      if (!window.ethereum) {
        //alert("Please install MetaMask");

        cleanNotifications();

        showNotification({
          title: "MetaMask Wallet Not Found",
          message: "Redirecting to Download Metamask...",
          icon: <IconX size={16} />,
          color: "red",
          autoClose: true,
          onClose: () => navigate("/install-metamask"),
        });
      } else {
        const chainId = 80001; // Mumbai Testnet

        if (window.ethereum.networkVersion !== chainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: web3.utils.toHex(chainId) }],
            });
          } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainName: "Mumbai Testnet",
                      chainId: web3.utils.toHex(chainId),
                      nativeCurrency: {
                        name: "MATIC",
                        decimals: 18,
                        symbol: "MATIC",
                      },
                      rpcUrls: [
                        "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
                      ],
                      blockExplorerUrls: ["https://mumbai.polygonscan.com"],
                    },
                  ],
                });
                // wasAdded is a boolean. Like any RPC method, an error may be thrown.
                const wasAdded = await window.ethereum.request({
                  method: "wallet_watchAsset",
                  params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                      address: SUCoin.address, // The address that the token is at.
                      symbol: "SUC", // A ticker symbol or shorthand, up to 5 chars.
                      decimals: 18, // The number of decimals in the token
                      image: null, // A string url of the token logo
                    },
                  },
                });

                showNotification({
                  title: "Enjoy!",
                  message:
                    "You have successfully added the Polygon Chain and SUCoin to your Metamask!",
                  icon: <IconCheck size={16} />,
                  color: "teal",
                  autoClose: true,
                });
              } catch (err) {
                showNotification({
                  title: "Error Occured!",
                  message:
                    "You have to add Polygon Chain and SUCoin token to your Metamask!",
                  icon: <IconX size={16} />,
                  color: "red",
                  autoClose: true,
                });
              }
            }
          }
        }

        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (!account) {
            setAccount(accounts[0]);
          }

          const token = Cookies.get("token");
          if (token) {
            const expired = isTokenExpired(token);
            const mismatch =
              accounts[0] !==
              JSON.parse(
                Buffer.from(token.split(".")[1], "base64").toString()
              )?.family_name?.toLowerCase();
            const tokenRole = JSON.parse(
              Buffer.from(token.split(".")[1], "base64")?.toString()
            )?.role.toLowerCase();

            console.log("Roleee:", tokenRole);

            if (expired || mismatch) {
              Cookies.remove("token");
              setLogged(false);
            } else {
              setLogged(true);
              console.log("Logged at auction:", logged);
            }
          }
        } catch (error) {
          showNotification({
            title: "Error Occured!",
            message:
              "You have to connect your Account! Please reload your page and connect to metamask.",
            icon: <IconX size={16} />,
            color: "red",
            autoClose: true,
          });
        }
      }
    };
    handleMetamask();
  }, []);

  const buyTokens = async (priceEntered) => {
    try {
      cleanNotifications();

      showNotification({
        title: "Signing the Transaction",
        message: "Please sign the transaction from your wallet.",
        loading: true,
        autoClose: false,
      });

      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();
      const signer = await provider.getSigner();

      const value = numberToFixedNumber(amount);

      var auctionSC = await new ethers.Contract(
        auction,
        FCFSAuction.abi,
        signer
      );

      var SUCoinContract = await new ethers.Contract(
        SUCoin.address,
        WrapperToken.abi,
        signer
      );

      var approveTx = await SUCoinContract.approve(auction, value);

      cleanNotifications();

      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      let receipt = await approveTx.wait(1);
      let bid1 = priceEntered
        ? await auctionSC.bid(value, userPrice)
        : await auctionSC.bid(value);

      cleanNotifications();

      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      let bid1_receipt = await bid1.wait(1);

      cleanNotifications();

      showNotification({
        title: "Bid is Successful!",
        message: `You have successfully invested in the project.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: true,
      });
    } catch (error) {
      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message:
          error.reason.charAt(0).toUpperCase() + error.reason.substring(1),
        icon: <IconX size={16} />,
        color: "red",
        autoClose: true,
      });

      return false;
    }
  };

  const withdraw = async () => {
    try {
      cleanNotifications();

      showNotification({
        title: "Signing the Transaction",
        message: "Please sign the transaction from your wallet.",
        loading: true,
        autoClose: false,
      });

      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();
      const signer = await provider.getSigner();

      var auctionSC = await new ethers.Contract(
        auction,
        OBFCFSAuction.abi,
        signer
      );

      cleanNotifications();

      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      await auctionSC.withDraw();

      cleanNotifications();

      showNotification({
        title: "Withdraw is Successful!",
        message: `You have successfully received the tokens of the project.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: true,
      });
    } catch (error) {
      console.log(error);

      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message:
          error.reason.charAt(0).toUpperCase() + error.reason.substring(1),
        icon: <IconX size={16} />,
        color: "red",
        autoClose: true,
      });

      return false;
    }
  };

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === "amount") setAmount(value);
    if (name === "amount2") setAmount(value);
    if (name === "userPrice") setUserPrice(value);
  };

  return (
    <>
      <div>
        <div className="item-card">
          <div>
            <img
              src={projectImage}
              alt=""
              style={{
                width: "100%",
                height: "45vh",
                objectFit: "fill",
              }}
            />
          </div>
          <div className="card-text-projectpage">
            <div className="card-total-projectpage">
              <div className="card-top-projectpage">
                <div className="card-title-projectpage-with-rating">
                  <div className="card-title-projectpage">{projectName}</div>
                  <Rating value={rating} fractions={5} readOnly />
                </div>
                <div className="card-desc-projectpage">
                  {projectDescription}
                </div>
              </div>
              <div className="card-bottom-projectpage">
                <div className="card-tokeninfo-time">
                  {startingDate == 0
                    ? "Not started"
                    : "Ending: " + new Date(endingDate * 1000).toDateString()}
                </div>
                <div className="card-tokeninfo-fund-raise">
                  Total Funds Raised: {parseFloat(totalRaise).toFixed(3)} SUCoin
                </div>
                {limit != null ? (
                  <div className="card-tokeninfo-limit">
                    Limit: {parseFloat(limit).toFixed(3)} SUCoins
                  </div>
                ) : null}
                {auctionType != "UncappedAuction" ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "2vh",
                    }}>
                    <div className="card-tokeninfo-sale">Sale Info:</div>
                    <Progress
                      radius="xl"
                      size={24}
                      sections={[
                        {
                          value:
                            (parseFloat(deposit) / parseFloat(tokenDist)) * 100,
                          color: "#2ac52a",
                          label: "Sold",
                          tooltip: `Sold ${parseFloat(deposit).toFixed(
                            3
                          )} ${tokenName} Tokens`,
                        },
                        {
                          value:
                            ((parseFloat(tokenDist) - parseFloat(deposit)) /
                              parseFloat(tokenDist)) *
                            100,
                          color: "#dfd116",
                          label: "Remaining",
                          tooltip: `Remaining ${(
                            parseFloat(tokenDist) - parseFloat(deposit)
                          ).toFixed(3)} ${tokenName} Tokens`,
                        },
                      ]}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-cards">
          <div className="invest-card">
            <div className="card-title-projectpage">{auctionType}</div>
            <div className="card-desc-projectpage">
              {auctionMechanism[auctionType]}
            </div>
          </div>
          <div className="invest-card">
            <div className="card-title-projectpage">Invest Now</div>

            <div className="invest-card-desc-projectpage">
              {auctionType == "OBDutchAuction" ? "Minimum" : null} Price:{" "}
              {parseFloat(price).toFixed(4)} SUCoin per {tokenName}
            </div>

            {logged && status == 1 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}>
                <>
                  <FloatingLabel
                    controlId="floatingInputGrid"
                    label={"Enter " + tokens[0]}
                    style={{ fontFamily: "Montserrat" }}
                    fontFamily="Montserrat">
                    <Form.Control
                      onChange={handleInput}
                      name="amount"
                      type="text"
                      value={amount}
                      style={{ fontFamily: "Montserrat" }}
                    />
                  </FloatingLabel>
                  {auctionType == "OBDutchAuction" ? (
                    <FloatingLabel
                      controlId="floatingInputGrid"
                      label={"Enter Token Price"}
                      style={{
                        fontFamily: "Montserrat",
                      }}>
                      <Form.Control
                        onChange={handleInput}
                        name="userPrice"
                        type="text"
                        value={userPrice}
                        style={{
                          fontFamily: "Montserrat",
                        }}
                      />
                    </FloatingLabel>
                  ) : (
                    <FloatingLabel
                      controlId="floatingInputGrid"
                      label={"Project Token"}
                      style={{ fontFamily: "Montserrat" }}
                      fontFamily="Montserrat">
                      <Form.Control
                        onChange={handleInput}
                        name="amount2"
                        type="text"
                        value={amount / price || 0}
                        style={{
                          fontFamily: "Montserrat",
                        }}
                      />
                    </FloatingLabel>
                  )}
                </>
              </div>
            ) : null}

            {logged && status == 3 ? (
              <>
                {limit != null ? (
                  <div
                    className="withdraw-token-button"
                    onClick={() => withdraw()}>
                    <a
                      style={{
                        cursor: "pointer",
                        color: "white",
                      }}>
                      Withdraw Tokens (Only Orderbook Auctions)
                    </a>
                  </div>
                ) : null}
              </>
            ) : logged && status == 1 ? (
              <>
                <div
                  className="buy-token-button"
                  onClick={() =>
                    buyTokens(auctionType == "OBDutchAuction" ? true : false)
                  }>
                  <a
                    style={{
                      cursor: "pointer",
                      color: "white",
                    }}>
                    Buy Token(s)
                  </a>
                </div>

                {auctionType == "OBDutchAuction" ? (
                  <div
                    className="buy-token-button"
                    onClick={() => buyTokens(false)}>
                    <a
                      style={{
                        cursor: "pointer",
                        color: "white",
                      }}>
                      Buy Token(s) From Minimum Price
                    </a>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

AuctionInfo.propTypes = {
  project: PropTypes.object,
  status: PropTypes.string,
};

export default AuctionInfo;
