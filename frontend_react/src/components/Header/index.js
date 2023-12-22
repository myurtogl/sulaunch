import "../../general.css";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import web3 from "web3";
import Cookies from "js-cookie";
import axios from "axios";
import { Buffer } from "buffer";
import { backendUrl } from "../../config";
import { showNotification, cleanNotifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [role, setRole] = useState(null);

  const [fname, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [signedMsg, setSignedmsg] = useState("");

  const closeShowSignIn = () => setShowSignin(false);
  const openShowSignIn = () => setShowSignin(true);

  const navigate = useNavigate();
  const handleLogOut = () => {
    Cookies.set("token", "");
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
        alert("Please install MetaMask");
      } else {
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

            if (expired || mismatch) {
              Cookies.remove("token");
              setRole(null);
            } else {
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
  });

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

      console.log("Result is: ", result);
      Cookies.set("token", result.data.data);

      const tokenRole = JSON.parse(
        Buffer.from(result.data.data?.split(".")[1], "base64")?.toString()
      )?.role.toLowerCase();
      alert("SUCCESS");

      navigate("/");
      setRole(tokenRole);
      setShowLogin(false);
    } catch (error) {
      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message:
          error.reason.charAt(0).toUpperCase() + error.reason.substring(1),
        icon: <IconX size={16} />,
        color: "red",
        autoClose: false,
      });
    }
  };

  return (
    <>
      {/*style={{backgroundColor:'#173A6A'}}*/}
      <Navbar
        sticky="top"
        collapseOnSelect
        expand="lg"
        variant="dark"
        className="navbarcolor">
        <Navbar.Brand
          className="navbar-element"
          onClick={() => {
            navigate("/");
          }}>
          SuLaunch
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => {
                navigate("/");
              }}>
              Home
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/projects");
              }}>
              Projects
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/auctions");
              }}>
              Auctions
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/tokenSwap");
              }}>
              Swap
            </Nav.Link>
            {role != null ? (
              <Nav.Link
                onClick={() => {
                  navigate("/apply");
                }}>
                Apply
              </Nav.Link>
            ) : null}
            <Nav.Link
              className="navbar-element"
              onClick={() => {
                navigate("/how-to-use");
              }}>
              How to Use
            </Nav.Link>
            {role === "admin" ? (
              <Nav.Link
                onClick={() => {
                  navigate("/admin");
                }}>
                Admin
              </Nav.Link>
            ) : null}
          </Nav>
          <Nav>
            {role != null ? (
              <>
                <NavDropdown
                  className="navbar-element"
                  align="end"
                  title={account}
                  id="collasible-nav-dropdown"
                  style={{ margin: "25px" }}>
                  <NavDropdown.Item
                    onClick={() => {
                      navigate("/profile");
                    }}>
                    Profile
                  </NavDropdown.Item>

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogOut}>
                    Log Out
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link className="navbar-element" onClick={handleLogin}>
                  Log In
                </Nav.Link>
                <Nav.Link className="navbar-element" onClick={openShowSignIn}>
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <RegisterModal
        showSignin={showSignin}
        closeShowSignIn={closeShowSignIn}></RegisterModal>
    </>
  );
};

const RegisterModal = (props) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [logged, setLogged] = useState(false);

  const [fname, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [signedMsg, setSignedmsg] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async () => {
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

      alert("YYSUCCESS");
      console.log(req);

      navigate("/");
    } catch (error) {
      console.log(error);

      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message:
          error.reason.charAt(0).toUpperCase() + error.reason.substring(1),
        icon: <IconX size={16} />,
        color: "red",
        autoClose: false,
      });
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

  return (
    <Modal
      show={props.showSignin}
      onHide={props.closeShowSignIn}
      animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>

      <Container style={{ padding: "2rem" }}>
        <FloatingLabel
          controlId="floatingInput"
          label="First Name"
          className="mb-3">
          <Form.Control
            type="fname"
            placeholder="First Name"
            name="fname"
            value={fname}
            onChange={handleInput}
          />
        </FloatingLabel>

        <FloatingLabel
          controlId="floatingPassword"
          label="Surname"
          className="mb-3">
          <Form.Control
            type="surname"
            placeholder="Surname"
            name="surname"
            value={surname}
            onChange={handleInput}
          />
        </FloatingLabel>

        <FloatingLabel
          controlId="floatingPassword"
          label="Username"
          className="mb-3">
          <Form.Control
            type="mail"
            placeholder="Username"
            name="username"
            value={username}
            onChange={handleInput}
          />
        </FloatingLabel>

        <FloatingLabel
          controlId="floatingPassword"
          label="E-mail"
          className="mb-3">
          <Form.Control
            type="email"
            placeholder="E-mail"
            name="mail"
            value={mail}
            onChange={handleInput}
          />
        </FloatingLabel>

        <Row className="justify-content-md-center">
          <Col md="auto">
            <Button variant="primary" type="submit" onClick={handleSignUp}>
              Sign Up
            </Button>
          </Col>
        </Row>
      </Container>
    </Modal>
  );
};

export default Header;
