import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// Components
//import Grid from './Grid';
import ProjectInfo from "./ProjectInfo/index";

// Hook

import axios from "axios";

import Cookies from "js-cookie";

import { ethers } from "ethers";
import ethersAbi from "../contracts_hardhat/artifacts/contracts/ProjectRegister.sol/ProjectRegister.json";
import { ProjectRegisterAddress } from "../config";

import { getFileFromIpfs } from "../helpers.js";

import LoadingIcon from "./LoadingIcon";

import { backendUrl } from "../config";

import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { IconX } from "@tabler/icons";

const mkdStr = `# {Freelance Finder Version 2}
## Project Abstact
Abstract part
## Project Details
details part
### Details Part 1
details part 1
### Details Part 2
details part 2

## [Details on how to write with markdown](https://www.markdownguide.org/basic-syntax/)

`;

const Project = ({ navigation }) => {
  const { projectId } = useParams();
  const [state, setState] = useState({ status: "default" });
  const [markdown, setMarkdown] = useState(mkdStr);
  const [isEditingChild, setEditingchild] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [isWhitelisted, setIswhitelisted] = useState(false);
  const [isOwner, setIsowner] = useState(false);
  const [owner, setOwner] = useState();
  const [signer, setSigner] = useState();
  const [hash, setHash] = useState();
  const [imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [project, setProject] = useState({
    rating: 0,
    imageUrl: "",
    markdown: "",
    projectDescription: "",
    projectName: "",
    status: "",
  });

  console.log(isOwner, "isOwner", project);

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

  useEffect(() => {
    const projectSetup = async () => {
      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .get("/Project/Get/" + projectId)
          .then((res) => {
            setProject(res.data.data);
            setMarkdown(res.data.data.markDown);
            resolve(res);
          })
          .catch((e) => {
            const err = "Unable to add the project";

            console.log(e);
            console.log(e.message);

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
    };
    projectSetup();
  }, []);

  useEffect(() => {
    const setup = async () => {
      if (project.fileHash == undefined) return;

      const CryptoJS = require("crypto-js");

      const provider =
        window.ethereum != null
          ? new ethers.providers.Web3Provider(window.ethereum)
          : ethers.providers.getDefaultProvider();
      const signer = await provider.getSigner();
      const registerContract = await new ethers.Contract(
        ProjectRegisterAddress,
        ethersAbi.abi,
        signer
      );

      const hashResult = "0x" + project.fileHash;

      const projInfo = await registerContract.projectsRegistered(hashResult);

      if ((await registerContract.statusList(await signer.getAddress())) == 1) {
        setIswhitelisted(true);
        console.log("whitelisted");
      } else {
        setIswhitelisted(false);
        console.log("NOT whitelisted");
      }
      setOwner(await projInfo.proposer);
      setSigner(await signer.getAddress());
      setHash(hashResult);
    };
    setup();
  }, [project]);

  useEffect(() => {
    const setupOwner = async () => {
      if (owner == signer) {
        setIsowner(true);
      } else {
        setIsowner(false);
      }
    };
    setupOwner();
  }, [owner, signer]);

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const handleEdit = async () => {
    setEditing(true);
  };

  const handleEditSubmission = async () => {
    setEditing(false);

    try {
      const apiInstance = axios.create({
        baseURL: backendUrl,
      });
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .put("/Project/UpdateMarkDown/" + projectId + "/" + markdown)
          .then((res) => {
            console.log("response: ", res.data);
            resolve(res);
          })
          .catch((e) => {
            const err = "Unable to add the project";
            reject(err);
          });
      });
      let result = await response2;
    } catch (error) {
      console.log(error);
    }
  };

  const getFile = async () => {
    console.log(project.fileHash);
    getFileFromIpfs(project.fileHash, "whitepaper").then((res) =>
      downloadFile(res.data)
    );

    const downloadFile = async (file) => {
      const reader = new FileReader();

      reader.readAsText(file);
      reader.onloadend = async () => {
        const data = window.URL.createObjectURL(file);
        const tempLink = await document.createElement("a");
        tempLink.href = data;
        tempLink.download = "Project_#" + project.projectID + ".pdf"; // some props receive from the component.
        tempLink.click();
      };
    };
  };

  useEffect(() => {
    const setupLoading = async () => {
      if (project.fileHash == undefined) return;
      const imageResult = await getFileFromIpfs(project.fileHash, "image");
      setImageURL(URL.createObjectURL(imageResult.data));
      setIsLoading(false);
    };
    setupLoading();
  }, [project]);

  const navigate = useNavigate();

  return isLoading ? (
    <NotificationsProvider position="bottom-center">
      <div className="project-detail-page">
        <LoadingIcon />
      </div>
    </NotificationsProvider>
  ) : (
    <NotificationsProvider position="bottom-center">
      <div className="project-detail-page">
        <ProjectInfo
          setProject={setProject}
          projectId={projectId}
          project={project}
          status={state.status}
          isOwner={isOwner}
          isWhitelisted={isWhitelisted}
          imageUrl={project.imageURL}
          projectName={project.projectName}
          rating={project.rating}
          projectDescription={project.projectDescription}
          proposalDate={project.date}
          projectStatus={project.status}
          approvalRatio={"b"}
          approvedVotes={"d"}
          fileHash={hash}
          rejectedVotes={"e"}
          tokenCount={"N/A"}
          tokenName={"N/A"}
          tokenPrice={"N/A"}
          isAuctionCreated={false}
          onClickCreateToken={() =>
            navigate("/createTokens", { state: { hash: hash } })
          }
          onClickCreateAuction={() =>
            navigate("/createAuction", { state: { hash: hash, id: projectId } })
          }
          projectImage={imageURL}
          getFile={getFile}
        />
      </div>
    </NotificationsProvider>
  );
};

export default Project;
