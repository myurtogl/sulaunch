import React, { useState, useEffect } from "react";
import "./Header.css";
import {
  IconUser,
  IconMenu2,
  IconX,
  IconCheck,
  IconWallet,
} from "@tabler/icons";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import web3 from "web3";
import Cookies from "js-cookie";
import axios from "axios";
import { Buffer } from "buffer";
import { backendUrl } from "../../config";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { MantineProvider } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { SuCoinAddress } from "../../config";

function Header() {
  console.log("Backend URL:", backendUrl);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  const [error, setError] = useState(false);
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState(null);
  const [hamburger, setHamburger] = useState(false);

  const closeShowSignIn = () => setShowSignin(false);
  const openShowSignIn = () => setShowSignin(true);
  const navigate = useNavigate();
  const handleLogOut = () => {
    Cookies.set("token", "");
    setLogged(false);
    setRole(null);
    navigate("/");
  };

  const isTokenExpired = (token) =>
    Date.now() >=
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).exp *
      1000;
  const [account, setAccount] = useState();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

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
                      address: SuCoinAddress, // The address that the token is at.
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
              setRole(null);
            } else {
              setLogged(true);
              setRole(tokenRole);
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

  const handleLogin = async () => {
    setError(false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const newAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let accounts = newAccounts;
      const from = web3.utils.toChecksumAddress(accounts[0]);
      let response = await axios.get(
        `${backendUrl}/Authentication/getnonce/` + from,
        {},
        config
      );

      let nonce = response.data.data;
      const exampleMessage = "LOGIN: " + nonce;
      const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
      const sign = await window.ethereum.request({
        method: "personal_sign",
        params: [msg, from, "Example password"],
      });
      console.log("Nonce is: ", nonce);
      console.log("Signedmsg is: ", sign);
      console.log("from is: ", from);

      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .post("/Authentication/Login", {
            Address: from,
            SignedMessage: sign,
          })
          .then((res) => {
            console.log(res.data);
            resolve(res);
          })
          .catch(() => {
            const err = ["Unable to add cart item. Please try again."];
            reject(err);
          });
      });
      let result = await response2;
      Cookies.set("token", result.data.data);
      //alert("SUCCESS")
      cleanNotifications();

      showNotification({
        title: "Success",
        message: `You have succesfully logged in to the SuLaunch.`,
        icon: <IconCheck size={16} />,
        color: "teal",
      });

      navigate("/");
      setLogged(true);
      //setRole(tokenRole);
      setShowLogin(false);
    } catch (error) {
      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message: "Your address does not match any registered accounts",
        icon: <IconX size={16} />,
        color: "red",
        autoClose: true,
      });
      setError(true);
    }
  };

  const handleHamburger = () => {
    setHamburger(!hamburger);
  };

  return (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className="Header">
          <div className="Header-web">
            <a href="/" className="Header-logo">
              SuLaunch
            </a>
            <div className="Header-links">
              <a href="/projects" className="Header-link">
                Projects
              </a>
              <a href="/auctions" className="Header-link">
                Auctions
              </a>
              {/*<a href='/tokenSwap' className='Header-link'>Swap</a>*/}
              {logged ? (
                <a href="/apply" className="Header-link">
                  Apply
                </a>
              ) : null}
              <a href="/how-to-use" className="Header-link">
                User Guide
              </a>
              <a href="/about" className="Header-link">
                About
              </a>
            </div>
            <Dropdown id="Header-user">
              <Dropdown.Toggle id="Header-user-toggle">
                {logged ? <IconUser /> : <IconWallet />}
              </Dropdown.Toggle>

              {logged ? (
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      navigate("/profile");
                    }}>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogOut}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              ) : (
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogin}>Login</Dropdown.Item>
                  <Dropdown.Item onClick={openShowSignIn}>
                    Sign Up
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            </Dropdown>
          </div>

          {hamburger ? (
            <div className="Header-mobile hamburger-active">
              <div className="Header-mobile-top">
                <a href="/" className="Header-logo">
                  SuLaunch
                </a>
                <div className="Header-hamburger" onClick={handleHamburger}>
                  {hamburger ? (
                    <IconX width={32} height={32} />
                  ) : (
                    <IconMenu2 width={32} height={32} />
                  )}
                </div>
              </div>
              <div className="Header-links-mobile">
                <div className="Header-links-mobile-links">
                  <a href="/projects" className="Header-link-mobile">
                    Projects
                  </a>
                  <a href="/auctions" className="Header-link-mobile">
                    Auctions
                  </a>
                  {/*<a href='/tokenSwap' className='Header-link-mobile'>Swap</a>*/}
                  <a href="/how-to-use" className="Header-link-mobile">
                    User Guide
                  </a>
                  <a href="/about" className="Header-link-mobile">
                    About
                  </a>
                </div>
                {logged ? (
                  <div className="Header-userarea">
                    <button
                      className="Header-link-mobile"
                      onClick={() => {
                        navigate("/profile");
                      }}>
                      Profile
                    </button>
                    <button
                      className="Header-link-mobile"
                      onClick={handleLogOut}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="Header-userarea">
                    <button
                      className="Header-link-mobile"
                      onClick={handleLogin}>
                      Login
                    </button>
                    <button
                      className="Header-link-mobile"
                      onClick={openShowSignIn}>
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="Header-mobile">
              <div className="Header-mobile-top">
                <a href="/" className="Header-logo">
                  SuLaunch
                </a>
                <div className="Header-hamburger" onClick={handleHamburger}>
                  {hamburger ? (
                    <IconX width={32} height={32} />
                  ) : (
                    <IconMenu2 width={32} height={32} />
                  )}
                </div>
              </div>
            </div>
          )}
          <RegisterModal
            showSignin={showSignin}
            closeShowSignIn={closeShowSignIn}></RegisterModal>
        </div>
      </NotificationsProvider>
    </MantineProvider>
  );
}

const RegisterModal = (props) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [fname, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [signedMsg, setSignedmsg] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    const form = event.currentTarget;
    console.log(validated);
    console.log("Validity:", form.checkValidity());
    event.preventDefault();
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
    } else {
      showNotification({
        title: "Pending",
        message: "Waiting for database control to finish.",
        loading: true,
        autoClose: false,
      });

      setError(false);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        let accounts = newAccounts;

        const exampleMessage = "REGISTER";
        const from = accounts[0];
        const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
        const sign = await window.ethereum.request({
          method: "personal_sign",
          params: [msg, from, "Example password"],
        });

        console.log("name", fname);
        console.log("sname", surname);
        console.log("uname", mail);
        console.log("mail", password);
        console.log("sign", sign);

        let req = await axios.post(
          `${backendUrl}/Authentication/Register`,
          {
            name: fname,
            surname: surname,
            username: username,
            mailAddress: mail,
            signedMessage: sign,
          },
          config
        );

        //alert("YYSUCCESS")
        cleanNotifications();

        showNotification({
          title: "Success",
          message: `Please verify your e-mail to complete sign-up.`,
          icon: <IconCheck size={16} />,
          color: "teal",
        });

        console.log(req);

        navigate("/");
        props.closeShowSignIn();
      } catch (error) {
        setError(true);
        //alert("ERROR")
        cleanNotifications();

        showNotification({
          title: "Error Occured!",
          message: "There is a problem with registration!",
          icon: <IconX size={16} />,
          color: "red",
          autoClose: true,
        });

        console.log(error);
      }

      setValidated(false);

      form.reset();
    }
  };

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === "fname") setName(value);
    if (name === "surname") setSurname(value);
    if (name === "username") setUsername(value);
    if (name === "mail") setMail(value);
    if (name === "signedMsg") setSignedmsg(value);
  };

  const [validated, setValidated] = useState(false);

  return (
    <Modal
      show={props.showSignin}
      onHide={props.closeShowSignIn}
      animation={false}>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontFamily: "Montserrat" }}>Sign Up</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSignUp}>
        <Container style={{ padding: "2rem" }}>
          <FloatingLabel
            controlId="floatingInput"
            label="First Name"
            className="mb-3"
            style={{ fontFamily: "Montserrat" }}>
            <Form.Control
              required
              type="fname"
              placeholder="First Name"
              name="fname"
              value={fname}
              onChange={handleInput}
              style={{ fontFamily: "Montserrat" }}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ fontFamily: "Montserrat" }}>
              Please provide your first name.
            </Form.Control.Feedback>
          </FloatingLabel>

          <FloatingLabel
            controlId="floatingPassword"
            label="Surname"
            className="mb-3"
            style={{ fontFamily: "Montserrat" }}>
            <Form.Control
              required
              type="surname"
              placeholder="Surname"
              name="surname"
              value={surname}
              onChange={handleInput}
              style={{ fontFamily: "Montserrat" }}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ fontFamily: "Montserrat" }}>
              Please provide your surname.
            </Form.Control.Feedback>
          </FloatingLabel>

          <FloatingLabel
            controlId="floatingPassword"
            label="Username"
            className="mb-3"
            style={{ fontFamily: "Montserrat" }}>
            <Form.Control
              required
              type="mail"
              placeholder="Username"
              name="username"
              value={username}
              onChange={handleInput}
              style={{ fontFamily: "Montserrat" }}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ fontFamily: "Montserrat" }}>
              Please provide your username.
            </Form.Control.Feedback>
          </FloatingLabel>

          <FloatingLabel
            controlId="floatingPassword"
            label="E-mail"
            className="mb-3"
            style={{ fontFamily: "Montserrat" }}>
            <Form.Control
              required
              type="email"
              placeholder="E-mail"
              name="mail"
              value={mail}
              onChange={handleInput}
              style={{ fontFamily: "Montserrat" }}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ fontFamily: "Montserrat" }}>
              Please provide your e-mail.
            </Form.Control.Feedback>
          </FloatingLabel>

          <Row className="justify-content-md-center">
            <Col md="auto">
              <button className="apply-button" type="submit">
                Sign Up
              </button>
            </Col>
          </Row>
        </Container>
      </Form>
    </Modal>
  );
};

export default Header;
