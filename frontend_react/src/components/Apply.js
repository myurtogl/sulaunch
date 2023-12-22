import React, { useState, useContext, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
// Components
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Container from "react-bootstrap/Col";
// Styles
import { Wrapper } from "./Projects.styles";

import UserContext from "../User";
import Cookies from "js-cookie";
import axios from "axios";
import { ethers } from "ethers";
import ethersAbi from "../contracts_hardhat/artifacts/contracts/ProjectRegister.sol/ProjectRegister.json";
import { ProjectRegisterAddress } from "../config";

import { useEffect } from "react";

import { backendUrl } from "../config";

import { MantineProvider } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";

const options = [
  { value: "fens", label: "FENS" },
  { value: "fass", label: "FASS" },
  { value: "fman", label: "FMAN" },
];

const abi = { address: ProjectRegisterAddress };

const Apply = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userSetup = async () => {
      try {
        const apiInstance = axios.create({
          baseURL: backendUrl,
        });
        apiInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${Cookies.get("token")}`;
        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/User/Get")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to  get the user";
              navigate("/notAuthorized");

              reject(err);
            });
        });
      } catch (error) {
        console.log(error);
      }
    };
    userSetup();
  }, []);

  const user = useContext(UserContext);
  const [projectName, setName] = useState("");
  const [projectDescription, setDescription] = useState("");
  const [error, setError] = useState(false);

  const [toastShow, setToastshow] = useState(false);
  const [toastText, setToasttext] = useState();
  const [toastHeader, setToastheader] = useState();

  const [isLoading, setLoading] = useState(false);

  const [fileToSubmit, setFile] = useState();
  const [imageToSubmit, setImage] = useState();

  const [fileName, setFilename] = useState();
  const [imageName, setImagename] = useState();

  //const [hashToSubmit, setHash] = useState();

  const [txConfirmed, setTxconfirmed] = useState(false);

  const connectToContract = async (hashToSubmit) => {
    //setLoading(true)
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

    try {
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      console.log("Before provider");
      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();

      const signer = await provider.getSigner();

      var registerContract = await new ethers.Contract(
        abi.address,
        ethersAbi.abi,
        signer
      );
      console.log("HashtoSUbmit", hashToSubmit);
      var registerTx = await registerContract.registerProject(
        "0x" + hashToSubmit
      );

      cleanNotifications();

      //setToastshow(false)
      //setToastshow(true)
      //setToastheader("Pending Transaction")
      //setToasttext("Waiting for transaction confirmation.")
      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      let receipt = await registerTx.wait();

      cleanNotifications();

      //setToastshow(false)
      //setToastshow(true)
      //setToastheader("Transaction Confirmed")
      //setToasttext("Your transaction is confirmed. Now, you can submit the project to our database.")
      showNotification({
        title: "Success",
        message: `Your project is added to Blockchain.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });

      setTxconfirmed(true);
      setLoading(false);

      console.log("RESULT: ", receipt);
      if (typeof receipt !== "undefined") {
        return true;
      }
      return false;
    } catch (error) {
      //setToastshow(true)
      //setToastheader("Catched an error")
      //setToasttext(error.data)

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

  const handleDB = async (file) => {
    setLoading(true);
    try {
      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .post("/Project/Add", {
            fileHex: fileToSubmit,
            projectName: projectName,
            projectDescription: projectDescription,
            imageUrl: imageToSubmit,
          })
          .then((res) => {
            //setToastshow(false)
            //setToastshow(true)
            //setToastheader("Succesfull")
            //setToasttext("Your project is submitted to our database.")
            cleanNotifications();

            showNotification({
              title: "Success",
              message: `Your project is submitted to the database.`,
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: false,
            });

            console.log("response: ", res.data);
            resolve(res);
          })
          .catch((e) => {
            const err = e.response.data;

            console.log(err);
            console.log(err.message);

            cleanNotifications();

            showNotification({
              title: "Error Occured!",
              message: err.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: false,
            });

            reject(err);
          });
      });
      let result = await response2;
      console.log(result);
      setLoading(false);

      return result?.data?.data?.fileHash;
    } catch (error) {
      console.log(error);
      console.log(error.message);

      setLoading(false);
      //setToastshow(true)
      //setToastheader("Failure")
      //setToasttext(error.data)

      cleanNotifications();

      showNotification({
        title: "Error Occured!",
        message: error.message,
        icon: <IconX size={16} />,
        color: "red",
        autoClose: false,
      });
    }
  };

  const downloadFile = async () => {
    const reader = new FileReader();
    const x = Buffer.from(fileToSubmit, "hex");
    const blob = new Blob([x.buffer]);

    reader.readAsArrayBuffer(blob);
    reader.onloadend = async () => {
      const data = window.URL.createObjectURL(blob);
      const tempLink = await document.createElement("a");
      tempLink.href = data;
      tempLink.download = fileName; // some props receive from the component.
      tempLink.click();
    };
  };

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === "name") setName(value);
    if (name === "description") setDescription(value);
  };

  //console.log(hashToSubmit)

  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
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

      const hashToSubmit = await handleDB();
      await connectToContract(hashToSubmit);

      setValidated(false);

      form.reset();
    }
  };

  function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }

  const SetWhitePaper = async (file) => {
    const CryptoJS = require("crypto-js");

    const reader = new FileReader();
    //reader.readAsBinaryString(file);
    reader.readAsArrayBuffer(file);
    console.log("fff", file);
    setFilename(file.path);
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");

    reader.onloadend = async () => {
      //handleContract(await buf2hex(reader.result ).toString(), CryptoJS.SHA256(await buf2hex(reader.result)).toString())
      setFile(await buf2hex(reader.result).toString());
    };
  };

  const SetImage = async (file) => {
    const CryptoJS = require("crypto-js");

    const reader = new FileReader();
    //reader.readAsBinaryString(file);
    reader.readAsArrayBuffer(file);
    console.log("fff", file);
    setImagename(file.path);
    console.log(file.path);
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");

    reader.onloadend = async () => {
      //handleContract(await buf2hex(reader.result ).toString(), CryptoJS.SHA256(await buf2hex(reader.result)).toString())
      setImage(await buf2hex(reader.result).toString());
    };
  };

  return (
    <>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <NotificationsProvider position="bottom-center">
          <div className="apply-page">
            <Wrapper style={{}}>
              <Container style={{ width: "30%", zIndex: "1" }}>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row className="g-2">
                    <Col md>
                      <Form.Group
                        controlId="floatingInputGrid"
                        label="Project Name">
                        <Form.Label style={{ fontFamily: "Montserrat" }}>
                          Project Name
                        </Form.Label>
                        <InputGroup hasValidation={{ validated }}>
                          <Form.Control
                            style={{ fontFamily: "Montserrat" }}
                            onChange={handleInput}
                            name="name"
                            type="text"
                            placeholder="Enter Project Name"
                            required
                          />
                          <Form.Control.Feedback
                            type="invalid"
                            style={{ fontFamily: "Montserrat" }}>
                            Please provide a project name.
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    {/*
							<Col md>
								<FloatingLabel controlId="floatingSelectGrid" label="Faculty">
									<Form.Select >
										<option value="1">FENS</option>
										<option value="2">FASS</option>
										<option value="3">FMAN</option>
									</Form.Select>
								</FloatingLabel>
							</Col>*/}
                  </Row>
                  <br />

                  <Row>
                    <Col>
                      <Form.Group
                        controlId="floatingTextarea2"
                        label="About the Project">
                        <Form.Label style={{ fontFamily: "Montserrat" }}>
                          About the Project
                        </Form.Label>
                        <Form.Control
                          onChange={handleInput}
                          name="description"
                          as="textarea"
                          placeholder="Explain your project."
                          style={{ height: "150px", fontFamily: "Montserrat" }}
                          required
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          style={{ fontFamily: "Montserrat" }}>
                          Please provide a project description.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <br />
                  <Col>
                    <Form.Group>
                      <Form.Label style={{ fontFamily: "Montserrat" }}>
                        Project Whitepaper
                      </Form.Label>
                      <Form.Control
                        onChange={(e) => SetWhitePaper(e.target.files[0])}
                        style={{ fontFamily: "Montserrat" }}
                        type="file"
                        placeholder="Explain your project...."
                        accept="application/pdf"
                        required></Form.Control>
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontFamily: "Montserrat" }}>
                        Please provide a project whitepaper.
                      </Form.Control.Feedback>
                      {/*
									<MyDropzone setFile={setFile} setFilename={setFilename} fileType="Whitepaper"></MyDropzone>
									*/}
                    </Form.Group>

                    <br />

                    <Form.Group>
                      <Form.Label style={{ fontFamily: "Montserrat" }}>
                        Project Image
                      </Form.Label>
                      <Form.Control
                        onChange={(e) => SetImage(e.target.files[0])}
                        style={{ fontFamily: "Montserrat" }}
                        type="file"
                        placeholder="Explain your project...."
                        accept="image/jpeg, image/png"
                        required></Form.Control>
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontFamily: "Montserrat" }}>
                        Please provide a project image.
                      </Form.Control.Feedback>
                      {/*
									<MyDropzone setFile={setFile} setFilename={setFilename} fileType="Whitepaper"></MyDropzone>
									*/}
                    </Form.Group>

                    {/*<Form.Group>
									<Form.Label>Project Image</Form.Label>
									<MyDropzone setFile={setImage} setFilename={setImagename} fileType="Image"></MyDropzone>
								</Form.Group>
								*/}

                    {/*<div className="App">
									<form>
										<input type="file" style={{
											width: "100%", height: "100px", backgroundColor: "#ffffff",
											borderRadius: "10px", border: "2px solid #21252A",
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}} />
									</form>
								</div>
								*/}
                  </Col>
                  <br />
                  <button
                    type="submit"
                    show={isLoading}
                    className="apply-button">
                    Submit Project to Database
                  </button>
                </Form>
              </Container>
            </Wrapper>
          </div>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

function MyDropzone({ setFile, setFilename, fileType }) {
  console.log(fileType);

  function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      const CryptoJS = require("crypto-js");

      const reader = new FileReader();
      //reader.readAsBinaryString(file);
      reader.readAsArrayBuffer(file);
      console.log("fff", file);
      setFilename(file.path);
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");

      reader.onloadend = async () => {
        //handleContract(await buf2hex(reader.result ).toString(), CryptoJS.SHA256(await buf2hex(reader.result)).toString())
        setFile(await buf2hex(reader.result).toString());
      };
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div
      {...getRootProps()}
      style={{
        width: "100%",
        height: "100px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        border: "2px solid #21252A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            justifyContent: "center",
          }}>
          Yeah, just like that
        </p>
      ) : (
        <p
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            justifyContent: "center",
          }}>
          Drop your {fileType} file here, or click to select the file.
        </p>
      )}
    </div>
  );
}

export default Apply;
