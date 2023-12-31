import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { SimpleGrid } from "@chakra-ui/react";

import { backendUrl } from "../config";

import AuctionCard from "./AuctionCard/AuctionCard";

import ToastBar from "./Toast";
import Cookies from "js-cookie";
import axios from "axios";
import { ethers } from "ethers";

import Maestro from "../contracts_hardhat/artifacts/contracts/Maestro.sol/Maestro.json";

import LoadingIcon from "./LoadingIcon";

import { MantineProvider } from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
  cleanNotifications,
} from "@mantine/notifications";
import { IconX } from "@tabler/icons";
import { MaestroAddress } from "../config";

const radios = [
  { name: "Off", value: "0" },
  { name: "Running", value: "1" },
  { name: "Paused", value: "2" },
  { name: "Ended", value: "3" },
  { name: "All", value: "4" },
];

const options = [
  { value: "fens", label: "FENS" },
  { value: "fass", label: "FASS" },
  { value: "fman", label: "FMAN" },
];

const IDs = [];

const provider =
  window.ethereum != null
    ? new ethers.providers.Web3Provider(window.ethereum)
    : ethers.providers.getDefaultProvider();
var MAESTRO = new ethers.Contract(MaestroAddress, Maestro.abi, provider);

export const getAuctionByStatus = async (status, count) => {
  const CryptoJS = require("crypto-js");
  const apiInstance = axios.create({
    baseURL: backendUrl,
  });
  apiInstance.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get(
    "token"
  )}`;
  let response2 = new Promise((resolve, reject) => {
    apiInstance
      .get("/Project/Get/All")
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

  const projectsWithAuctions = result.data.data.filter(
    (project) => project.isAuctionCreated
  );

  console.log("Projects with auctions:", projectsWithAuctions);

  return getAuctionByStatusFromList(status, count, projectsWithAuctions);
};

export const getAuctionByStatusFromList = async (
  status,
  count,
  projectsWithAuctions
) => {
  const hashToProject = Object.fromEntries(
    projectsWithAuctions.map((project) => [
      ("0x" + project.fileHash).toLowerCase(),
      project,
    ])
  );
  const auctionData = await MAESTRO.getProjectSurfaceByStatus(
    Object.keys(hashToProject),
    status % 4,
    count ?? projectsWithAuctions.length,
    status == 4
  );
  const auctionDataCombined = auctionData
    .filter((auction) => auction.auctionType !== "")
    .map((auction) => {
      let newAuction = Object.assign([], auction);
      Object.assign(
        newAuction,
        (({
          projectName,
          projectDescription,
          imageUrl,
          projectID,
          fileHash,
          rating,
        }) => ({
          projectName,
          projectDescription,
          imageUrl,
          projectID,
          fileHash,
          rating,
        }))(hashToProject[auction.projectHash.toLowerCase()])
      );
      return newAuction;
    });
  return auctionDataCombined;
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [alignment, setAlignment] = useState(radios[4]);
  const [listedAuctions, setListedAuctions] = useState();

  const handleChange = async (newAlignment) => {
    if (newAlignment != null) {
      await setAlignment(newAlignment);
    }
  };

  const [var2, setVar2] = useState();
  const [var3, setVar3] = useState();
  const [var4, setVar4] = useState();
  const [var5, setVar5] = useState();

  const [toastShow, setToastshow] = useState(false);
  const [toastText, setToasttext] = useState();
  const [toastHeader, setToastheader] = useState();
  const [projects, setProjects] = useState();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAuctions = async () => {
      try {
        const tempAuctions = await getAuctionByStatus(alignment.value);
        console.log("TEMP AUCTIONS", tempAuctions);
        setAuctions(tempAuctions);
        setListedAuctions(tempAuctions);
        setIsLoading(false);
      } catch (error) {
        //setToastshow(true)
        //setToastheader("Catched an error")
        //setToasttext(error.message)

        console.log(error);
        console.log(error.message);

        cleanNotifications();

        showNotification({
          title: "Error Occured!",
          message: error.message,
          icon: <IconX size={16} />,
          color: "red",
          autoClose: false,
        });

        return false;
      }
    };
    getAuctions();
    setAlignment(4);
  }, []);

  const handleInput = (e) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    // if (name === 'var1') setVar1(value);
    if (name === "var2") setVar2(value);
    if (name === "var3") setVar3(value);
    if (name === "var4") setVar4(value);
    if (name === "var5") setVar5(value);
  };

  useEffect(() => {
    const setuplistener = async () => {
      try {
        setListedAuctions(await getAuctionByStatus(radios[alignment].value));
      } catch {}
    };
    setuplistener();
  }, [alignment]);

  const navigate = useNavigate();

  // TODO: BIG NUMBER ISSUE

  return isLoading ? (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className={"auctions-page"}>
          <LoadingIcon />
        </div>
      </NotificationsProvider>
    </MantineProvider>
  ) : (
    <div className={"auctions-page"}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ButtonGroup>
          <Button
            className={
              alignment === 4
                ? "filter-button-active"
                : "filter-button-deactive"
            }
            onClick={() => {
              handleChange(4);
            }}
            value={radios[4].value}>
            {radios[4].name}{" "}
          </Button>
          <Button
            className={
              alignment === 0
                ? "filter-button-active"
                : "filter-button-deactive"
            }
            onClick={() => {
              handleChange(0);
            }}
            value={radios[0].value}>
            {radios[0].name}{" "}
          </Button>
          <Button
            className={
              alignment === 1
                ? "filter-button-active"
                : "filter-button-deactive"
            }
            onClick={() => {
              handleChange(1);
            }}
            value={radios[1].value}>
            {radios[1].name}{" "}
          </Button>
          <Button
            className={
              alignment === 2
                ? "filter-button-active"
                : "filter-button-deactive"
            }
            onClick={() => {
              handleChange(2);
            }}
            value={radios[2].value}>
            {radios[2].name}{" "}
          </Button>
          <Button
            className={
              alignment === 3
                ? "filter-button-active"
                : "filter-button-deactive"
            }
            onClick={() => {
              handleChange(3);
            }}
            value={radios[3].value}>
            {radios[3].name}{" "}
          </Button>
        </ButtonGroup>
      </div>
      <ToastBar
        toastText={toastText}
        toastHeader={toastHeader}
        toastShow={toastShow}
        setToastshow={setToastshow}></ToastBar>

      <br></br>

      <div style={{ width: "90%", textAlign: "center", margin: "auto" }}>
        {listedAuctions.length > 0 ? (
          <SimpleGrid minChildWidth="40vw" spacing="40px">
            {listedAuctions.map((project, index) => (
              <AuctionCard
                project={project}
                fileHash={project.fileHash}
                imageUrl={project.imageUrl}
                projectName={project.projectName}
                projectDescription={project.projectDescription}
                auctionType={project.auctionType}
                tokenName={project.tokenName}
                totalFund={"N/A"}
                projectID={project.projectID}
              />
            ))}
          </SimpleGrid>
        ) : (
          <div>
            <div
              className="sectionName"
              style={{
                display: "flex",
                justifyContent: "center",
              }}>
              No Auctions Found
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;
