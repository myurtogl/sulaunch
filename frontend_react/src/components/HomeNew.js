import React, { useState, useEffect } from "react";
import BasicCarousel from "./Carousel";
import axios from "axios";
import Cookies from "js-cookie";
import { fixedNumberToNumber, getFileFromIpfs } from "../helpers.js";
// Hook
import { useHomeFetch } from "../hooks/useHomeFetch";
// Image
import { getAuctionByStatus } from "./Auctions.js";
import { useNavigate } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";
import { backendUrl } from "../config";
import { ethers } from "ethers";
import AuctionABI from "../contracts_hardhat/artifacts/contracts/UpgradeableAuctions/Auction.sol/Auction.json";

const HomeNew = () => {
  const {
    state,
    loading,
    error,
    liveAuction = [],
    contract,
    //searchTerm,
    setSearchTerm
    //setIsLoadingMore
  } = useHomeFetch();

  const provider =
    window.ethereum != null
      ? new ethers.providers.Web3Provider(window.ethereum)
      : ethers.providers.getDefaultProvider();

  const [totalSUCoinRaise, setTotalSUCoinRaise] = useState(0);
  const [totalProjectCount, setTotalProjectCount] = useState(0);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [auctions, setAuctions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [auctionIndex, setAuctionIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  //Gets x amount of random auctions
  //Status,Count
  //Status - 0 Off  1 - Running 2 - Finished
  //Count should be fixed later

  useEffect(() => {
    const setup = async () => {
      try {
        const apiInstance = axios.create({
          baseURL: backendUrl
        });
        apiInstance.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get("token")}`;
        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/Project/GetProjects/5")
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

        let response3 = new Promise((resolve, reject) => {
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
        let result1 = await response3;
        setTotalProjectCount(result1.data.data.length);

        let response4 = new Promise((resolve, reject) => {
          apiInstance
            .get("/User/LearnUserCount")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to add the project";
              reject(err);
            });
        });
        let result2 = await response4;

        console.log("UserCount result2:", result2.data.data);
        setTotalUserCount(result2.data.data);

        const tempAuctions2 = await getAuctionByStatus(4);
        const totalRaised = await Promise.all(
          tempAuctions2.map(async (auction) => {
            const address = auction.auction;
            const AUCTION = new ethers.Contract(address, AuctionABI.abi, provider);
            return await AUCTION.totalDepositedSucoins();
          })
        );
        const totalRaisedResult = totalRaised.reduce((acc, curr) => acc + parseFloat(fixedNumberToNumber(curr)), 0);
        setTotalSUCoinRaise(totalRaisedResult);

        const tempAuctions = await getAuctionByStatus(1, 5);
        const getImagePromise = (selected) =>
          getFileFromIpfs(selected.fileHash, "image").then(
            (imageInfo) => (selected.imageURL = URL.createObjectURL(imageInfo.data))
          );
        const tempProjects = result.data.data;
        await Promise.all(tempProjects.concat(tempAuctions).map(getImagePromise));

        setProjects(tempProjects);
        setAuctions(tempAuctions);
      } catch (error) {
        console.log(error);
      }
      //setProjects(await )
      setIsLoading(false);

      console.log(auctions[0]);
      console.log("Random projects:", projects);
    };
    setup();
  }, []);

  const navigate = useNavigate();
  const increaseProjectIndex = () => {
    setProjectIndex((projectIndex + 1) % projects.length);
  };
  const increaseAuctionIndex = () => {
    setAuctionIndex((auctionIndex + 1) % auctions.length);
  };
  const decreaseProjectIndex = () => {
    setProjectIndex((projectIndex - 1 + projects.length) % projects.length);
  };
  const decreaseAuctionIndex = () => {
    setAuctionIndex((auctionIndex - 1 + auctions.length) % auctions.length);
  };

  const navigateProjectDetail = (projectId) => {
    navigate("projects/" + projectId);
  };
  const navigateAuctionDetail = (projectId) => {
    navigate("auction/" + projectId, { state: auctions[auctionIndex] });
  };

  const courasel = (type) => {
    if (type == "Projects") {
      var selectedList = projects;
      var selectedIndex = projectIndex;
      var indexIncrease = increaseProjectIndex;
      var indexDecrease = decreaseProjectIndex;
      var navigateTarget = navigateProjectDetail;
      var buttonText = "More Project Details";
    } else {
      var selectedList = auctions;
      var selectedIndex = auctionIndex;
      var indexIncrease = increaseAuctionIndex;
      var indexDecrease = decreaseAuctionIndex;
      var navigateTarget = navigateAuctionDetail;
      var buttonText = "Go To Auction";
    }

    if (selectedList.length > 0) {
      //Get pictures
      const selected = selectedList[selectedIndex];
      console.log(`Random ${type}: ${selectedList}`);

      console.log(selected.imageURL);

      return projects.length > 0 ? (
        <div className="sectionName" style={{ paddingBottom: "15px", display: "flex", justifyContent: "center" }}>
          <BasicCarousel list={projects} style={{ display: "flex", justifyContent: "center" }} />
        </div>
      ) : null;
    }
  };

  if (error) return <div>Something went wrong ...</div>;

  return (
    <>
      {isLoading ? (
        <div className={"home-page"}>
          <div className="sectionName" style={{ paddingLeft: "50px", paddingTop: "25px", paddingBottom: "25px" }}></div>
          <LoadingIcon />
        </div>
      ) : (
        <>
          <div className={"home-page"}>
            <div className="sectionName"></div>
            {courasel("Projects")}
          </div>
          <div className="home" aria-hidden="true">
            <div style={{ height: "5vh" }}></div>
            <div className="home-banner">
              <p className="home-banner-title">Your project ideas</p>
              <p className="home-banner-desc">SuLaunch turns your ideas into reality</p>
              <div className="home-banner-pill">
                <a href="/projects">See Live Projects</a>
              </div>
            </div>
            <div className="home-stats-col-large">
              <p className="home-stats-title">Statistics</p>
              <div className="home-stats-row">
                <div className="home-stats-stat">
                  <p className="home-stats-stat-title"># of Users</p>
                  <p className="home-stats-stat-value">{totalUserCount}</p>
                </div>
                <div className="home-stats-stat">
                  <p className="home-stats-stat-title"># of Projects Applied</p>
                  <p className="home-stats-stat-value">{totalProjectCount}</p>
                </div>
                <div className="home-stats-stat">
                  <p className="home-stats-stat-title">Total SUCoin Raised</p>
                  <p className="home-stats-stat-value">{totalSUCoinRaise} SUC</p>
                </div>
              </div>

              {/*<div className='home-stats-stat'>
                <p className='home-stats-stat-title'>Max SUCoin Raise / Project</p>
                <p className='home-stats-stat-value'>--Stat Here--</p>
              </div>*/}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HomeNew;
