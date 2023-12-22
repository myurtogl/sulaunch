import React, { useState } from "react";
import PropTypes from "prop-types";
// Styles

import { FormControl } from "@chakra-ui/react";
import { Progress, Rating } from "@mantine/core";

import axios from "axios";
import Cookies from "js-cookie";

import { ethers } from "ethers";
import ethersAbi from "../../contracts_hardhat/artifacts/contracts/ProjectRegister.sol/ProjectRegister.json";
import Maestro from "../../contracts_hardhat/artifacts/contracts/Maestro.sol/Maestro.json";

import { ProjectRegisterAddress } from "../../config";
import { useEffect } from "react";

import Auction from "../../contracts_hardhat/artifacts/contracts/UpgradeableAuctions/CappedTokenAuction.sol/CappedTokenAuction.json";

import { fixedNumberToNumber } from "../../helpers";

import { backendUrl } from "../../config";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  Input,
} from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";

import { showNotification, cleanNotifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";

import { MaestroAddress } from "../../config";

const maestro = { address: MaestroAddress };
const abi = { address: ProjectRegisterAddress };

const ProjectInfo = ({
  setProject,
  projectImage,
  projectId,
  project,
  status,
  rating,
  isOwner,
  isWhitelisted,
  fileHash,
  proposalDate,
  projectStatus,
  isAuctionCreated,
  onClickCreateToken,
  onClickCreateAuction,
  getFile,
  userEditFunction,
}) => {
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isStartAuctionOpen,
    onOpen: onStartAuctionOpen,
    onClose: onStartAuctionClose,
  } = useDisclosure();

  const [totalWhitelistCount, setTotalWhitelistCount] = useState();
  const [approveVotes, setApprove] = useState();
  const [rejectVotes, setReject] = useState();
  const [hash, setHash] = useState();
  const [votesNeeded, setVotesneeded] = useState();
  const [isEditing, setEditing] = useState(false);
  const [ratingGiven, setRatingGiven] = useState(0);

  const [projectName, setName] = useState("");
  const [projectDescription, setDescription] = useState("");
  const [projectImg, setImg] = useState("");
  const [projectRating, setProjectRating] = useState(0);

  const [auctionDuration, setAuctionDuration] = useState(0);

  const startAuction = async (auctionContract) => {
    //1 day in seconds
    console.log("Auction Duration:", auctionDuration);

    try {
      await auctionContract.startAuction(auctionDuration * 3600); // should be second

      cleanNotifications();

      showNotification({
        title: "Auction has Started",
        message: `You can access the auction details on auction page`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });
    } catch (error) {
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
        autoClose: true,
      });
    }
  };

  let startAuctionCallback = async (event) => {
    event.preventDefault();
    onStartAuctionClose();
    const provider =
      window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();

    const signer = await provider.getSigner();

    await startAuction(
      new ethers.Contract(project.auction, Auction.abi, signer)
    );
  };

  useEffect(() => {
    const getProjectInfo = async () => {
      if (fileHash === hash) return;

      setHash(fileHash);

      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();

      const signer = await provider.getSigner();

      var registerContract = new ethers.Contract(
        abi.address,
        ethersAbi.abi,
        signer
      );
      var maestroContract = new ethers.Contract(
        maestro.address,
        Maestro.abi,
        signer
      );

      const projectInfo = await maestroContract.projectTokens(fileHash);

      const { tokenName } = (
        await maestroContract.getAllAuctionsByHashList([fileHash])
      )[0];

      console.log(
        "Project token name",
        (await maestroContract.getAllAuctionsByHashList([fileHash]))[0]
      );

      project.tokenName = tokenName;

      project.auction = projectInfo?.auction;

      project.isAuctionCreated = project.auction != 0;

      if (project.isAuctionCreated) {
        var cappedContract = new ethers.Contract(
          project.auction,
          Auction.abi,
          signer
        );
        try {
          const tokenSupply =
            await cappedContract.numberOfTokensToBeDistributed();
          project.tokenSupply = fixedNumberToNumber(tokenSupply);
          console.log(tokenSupply);
        } catch {}
      }

      project.auctionType = projectInfo?.auctionType;

      setProject(project);
      setProjectRating(rating);

      var threshold = await registerContract.threshold();
      var wlCount = await registerContract.whitelistedCount();
      const votes = await registerContract.projectsRegistered(fileHash);

      setTotalWhitelistCount(parseInt(wlCount));

      setApprove(parseInt(await votes.approved));
      setReject(parseInt(await votes.rejected));
      setVotesneeded(
        Math.ceil((parseInt(wlCount) * parseInt(threshold)) / 100)
      );
      //changeProjectStatus()
    };
    getProjectInfo();
  });

  const changeProjectStatus = async () => {
    const apiInstance = axios.create({
      baseURL: backendUrl,
    });
    apiInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${Cookies.get("token")}`;
    let response2 = new Promise((resolve, reject) => {
      apiInstance
        .put("/Project/ChangeStatus/" + projectId)
        .then((res) => {
          console.log(res.data);
          resolve(res);
        })
        .catch((e) => {
          const err = "Unable to add the project";

          cleanNotifications();

          showNotification({
            title: "Error Occured!",
            message: e.message,
            icon: <IconX size={16} />,
            color: "red",
            autoClose: false,
          });

          reject(err);
          console.log(e);
        });
    });
  };

  const approveProject = async () => {
    try {
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

      cleanNotifications();

      showNotification({
        title: "Signing the Transaction",
        message: "Please sign the transaction from your wallet.",
        loading: true,
        autoClose: false,
      });

      var registerTx = await registerContract.voteProposal(hash, true);
      cleanNotifications();

      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      var receipt = await registerTx.wait(1);

      const votes = await registerContract.projectsRegistered(hash);
      console.log("🚀 ~ file: index.js:284 ~ approveProject ~ hash:", hash);
      console.log("votes:", votes);
      cleanNotifications();

      showNotification({
        title: "Success",
        message: `Voting process completed.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });

      setApprove(parseInt(approveVotes) + 1);
      if (votes.finalized) {
        changeProjectStatus();
      }
    } catch (error) {
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
    }
  };

  const rejectProject = async () => {
    try {
      const CryptoJS = require("crypto-js");
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

      cleanNotifications();

      showNotification({
        title: "Signing the Transaction",
        message: "Please sign the transaction from your wallet.",
        loading: true,
        autoClose: false,
      });

      var registerTx = await registerContract.voteProposal(hash, false);

      cleanNotifications();

      showNotification({
        title: "Pending Transaction",
        message: "Waiting for transaction confirmation.",
        loading: true,
        autoClose: false,
      });

      var receipt = await registerTx.wait(1);

      setReject(rejectVotes + 1);

      const votes = await registerContract.projectsRegistered(hash);

      cleanNotifications();

      showNotification({
        title: "Success",
        message: `Voting process completed.`,
        icon: <IconCheck size={16} />,
        color: "teal",
        autoClose: false,
      });

      if (votes.finalized) {
        changeProjectStatus();
      }
    } catch (error) {
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
    }
  };

  const submitChanges = async () => {
    const apiInstance = axios.create({
      baseURL: backendUrl,
    });
    apiInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${Cookies.get("token")}`;
    let response2 = new Promise((resolve, reject) => {
      apiInstance
        .put("/Project/Update/", {
          projectID: projectId,
          projectName: projectName,
          projectDescription: projectDescription,
          imageUrl: projectImg,
          rating: project.rating,
          status: project.status,
          markDown: project.markDown,
          fileHash: project.fileHash,
        })
        .then((res) => {
          console.log(res.data);
          resolve(res);
        })
        .catch((e) => {
          const err = "Unable to add the project";
          reject(err);
          console.log(e);
        });
    });
    let result = await response2;

    apiInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${Cookies.get("token")}`;
    response2 = new Promise((resolve, reject) => {
      apiInstance
        .get("/Project/Get/" + projectId)
        .then((res) => {
          setProject(res.data.data);
          console.log("run bitch", res.data.data);
          console.log("PROJ UPDATED", res.data.data);
          resolve(res);
        })
        .catch((e) => {
          const err = "Unable to add the project";
          reject(err);
        });
    });
    result = await response2;
    setEditing(false);
  };

  const showEdit = async () => {
    setEditing(true);
  };

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (name === "name") setName(value);
    if (name === "description") setDescription(value);
    if (name === "imgUrl") setImg(value);
    if (name === "auctionDuration") setAuctionDuration(value);
  };

  const ratingChanged = (newRating) => {
    project.tempRating = newRating;
  };

  const updateDatabase = async (event) => {
    onEditClose();
    try {
      event.preventDefault();

      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .put(`/Project/Rate/${projectId}/${ratingGiven}`)
          .then((res) => {
            console.log("response: ", res.data);
            resolve(res);

            cleanNotifications();

            showNotification({
              title: "Your Rating has Successfully Received",
              message: "Please check the updated rating of the project.",
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: true,
            });
          })
          .catch((e) => {
            const err = "Unable to rate the project";

            cleanNotifications();

            showNotification({
              title: "Error Occured!",
              message: e.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: true,
            });

            reject(err);
          });
      });
      let result = await response2;
      setProject(result.data.data);
      setProjectRating(result.data.data.rating);
    } catch (error) {
      console.log(error);
    }
  };

  const whitelistesButtonGroup = (isWhiteListed) => {
    return isWhiteListed ? (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <div className="whitelist-button" onClick={approveProject}>
          <a style={{ cursor: "pointer", color: "white" }}>Approve</a>
        </div>
        <div className="whitelist-button" onClick={rejectProject}>
          <a style={{ cursor: "pointer", color: "white" }}>Reject</a>
        </div>
      </div>
    ) : null;
  };

  const ownerButtonGroup = (isOwner, isAuctionCreated, project) => {
    return isOwner ? (
      <div
        className="abc"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <div className="whitelist-button" onClick={onClickCreateToken}>
          <a style={{ cursor: "pointer", color: "white" }}>Create Tokens</a>
        </div>
        {!project.isAuctionCreated ? (
          <div
            className="whitelist-button"
            onClick={() => onClickCreateAuction()}>
            <a style={{ cursor: "pointer", color: "white" }}>Create Auction</a>
          </div>
        ) : (
          <div className="whitelist-button" onClick={onStartAuctionOpen}>
            <a style={{ cursor: "pointer", color: "white" }}>
              Start Auction
              <Modal
                isCentered
                onClose={onStartAuctionClose}
                isOpen={isStartAuctionOpen}
                motionPreset="slideInBottom">
                <ModalOverlay zIndex={1000} />
                <ModalContent>
                  <ModalHeader fontFamily={"Montserrat"}>
                    Start Auction
                  </ModalHeader>
                  <ModalCloseButton />
                  <form onSubmit={startAuctionCallback}>
                    <ModalBody>
                      <FormControl isRequired>
                        <FormLabel fontFamily={"Montserrat"}>
                          Please enter the duration of the auction in hours
                        </FormLabel>
                        <Input
                          name="auctionDuration"
                          onChange={handleInput}
                          placeholder="Auction Duration"
                          fontFamily={"Montserrat"}
                        />
                      </FormControl>
                    </ModalBody>
                    <ModalFooter>
                      <button type="submit" className="apply-button">
                        Start Auction
                      </button>
                    </ModalFooter>
                  </form>
                </ModalContent>
              </Modal>
            </a>
          </div>
        )}
      </div>
    ) : null;
  };

  const baseButtonGroup = () => {
    return (
      <div
        className="abc"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <div className="whitelist-button" onClick={getFile}>
          <a style={{ cursor: "pointer", color: "white" }}>
            Download Project PDF
          </a>
        </div>
        <div className="whitelist-button" onClick={onEditOpen}>
          <a style={{ cursor: "pointer", color: "white" }}>Rate Project</a>
          <Modal
            isCentered
            onClose={onEditClose}
            isOpen={isEditOpen}
            motionPreset="slideInBottom"
            backgroundColor={"black"}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Enter Your Rating</ModalHeader>
              <ModalCloseButton />
              <form onSubmit={updateDatabase}>
                <ModalBody>
                  <FormControl isRequired>
                    <Rating
                      value={ratingGiven}
                      fractions={5}
                      onChange={setRatingGiven}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <button type="submit" className="apply-button">
                    Send Rating
                  </button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        </div>
      </div>
    );
  };

  const getRibbonColor = (status) => {
    var color = "";
    switch (status) {
      case "Approved":
        color = "#2ac52a";
        break;
      case "Pending":
        color = "#dfd116";
        break;
      case "Rejected":
        color = "#df1616";
        break;
      default:
        color = "#dfd116";
    }
    const style = {
      backgroundColor: color,
    };
    return style;
  };

  const getRibbonColorForProgressBar = (status) => {
    var color = "";
    switch (status) {
      case "Approved":
        color = "#2ac52a";
        break;
      case "Pending":
        color = "#dfd116";
        break;
      case "Rejected":
        color = "#df1616";
        break;
      default:
        color = "#dfd116";
    }

    return color;
  };

  return (
    <>
      <div>
        <div className="ribbon ribbon-top-left">
          <span style={getRibbonColor(projectStatus)}>{projectStatus}</span>
        </div>
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
                  <div className="card-title-projectpage">
                    {project.projectName}
                  </div>
                  <Rating value={rating} fractions={5} readOnly />
                </div>
                <div className="card-desc-projectpage">
                  {project.projectDescription}
                </div>
              </div>
              <div className="card-bottom-projectpage">
                <div className="card-tokeninfo-time">
                  <div className="card-tokeninfo">
                    {project.tokenName
                      ? project.tokenName
                      : `Token is not defined!`}
                  </div>
                  <div className="card-time-projectpage">
                    Proposed on{" "}
                    {proposalDate
                      ? proposalDate.substring(0, proposalDate.indexOf("T"))
                      : null}
                  </div>
                </div>
                <div style={{ width: "100%" }}>
                  <Progress
                    radius="xl"
                    size={24}
                    sections={[
                      {
                        value: (approveVotes / totalWhitelistCount) * 100,
                        color: "#2ac52a",
                        label: "Approval",
                        tooltip: `Approved by ${approveVotes}`,
                      },
                      {
                        value: (rejectVotes / totalWhitelistCount) * 100,
                        color: "#df1616",
                        label: "Rejection",
                        tooltip: `Rejected by ${rejectVotes}`,
                      },
                      {
                        value:
                          ((totalWhitelistCount - approveVotes - rejectVotes) /
                            totalWhitelistCount) *
                          100,
                        color: "#dfd116",
                        label: "Pending",
                        tooltip: `${
                          totalWhitelistCount - approveVotes - rejectVotes
                        } remaining votes`,
                      },
                    ]}
                  />
                </div>
                {baseButtonGroup()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-cards">
        {isWhitelisted ? (
          <div className="whitelist-card">
            <div className="card-title-projectpage">Whitelisted</div>
            <div className="card-desc-projectpage">
              You can approve/reject the project since you are the whitelisted
              user.
            </div>
            {whitelistesButtonGroup(isWhitelisted)}
          </div>
        ) : null}
        {isOwner ? (
          <div className="whitelist-card">
            <div className="card-title-projectpage">Project Owner</div>
            <div className="card-desc-projectpage">
              You can create tokens and create/start auction since you are the
              project owner.
            </div>
            {ownerButtonGroup(isOwner, isAuctionCreated, project)}
          </div>
        ) : null}
      </div>
    </>
  );
};

ProjectInfo.propTypes = {
  project: PropTypes.object,
  status: PropTypes.string,
};

export default ProjectInfo;
