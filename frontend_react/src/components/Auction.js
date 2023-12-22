import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuctionInfo from "./AuctionInfo";

import { fixedNumberToNumber, getAllPublicVariables } from "../helpers.js";
import { ethers } from "ethers";

import { getFileFromIpfs } from "../helpers.js";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import PriceChart from "./PriceChart";

import LoadingIcon from "./LoadingIcon";

import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

const Auction = (props) => {
  const { state } = useLocation();
  const { auctionType, auction, projectId } = state;
  const [imageURL, setImageURL] = useState("");
  const [finishTime, setFinishTime] = useState(null);

  const [currentData, setCurrentData] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [historicData, setHistoricData] = useState();

  const provider =
    window.ethereum != null
      ? new ethers.providers.Web3Provider(window.ethereum)
      : ethers.providers.getDefaultProvider();

  const auctionTypesForChart = [
    "DutchAuction",
    "OBFCFSAuction",
    "PseudoCappedAuction",
    "StrictDutchAuction",
    "UncappedAuction",
    "FCFSAuction",
    "OBDutchAuction",
  ];

  const {
    startTime,
    endTime,
    startingPrice,
    currentPrice,
    initDist,
    finalRate,
    minimumPrice,
    tokenDist,
    totalDeposit,
    soldTokens,
  } = currentData ?? {};

  const refreshInfo = async (abi, auctionContract) => {
    const {
      rate,
      soldProjectTokens,
      numberOfTokensToBeDistributed,
      minPrice,
      startTime,
      latestEndTime,
      totalDepositedSucoins,
      getCurrentRate,
      finalRate,
      getTotalSupply,
      initTokens,
      getStatus,
      fundLimitPerUser,
    } = await getAllPublicVariables(abi, auctionContract);
    const currentSupply = (getTotalSupply ?? numberOfTokensToBeDistributed)[0];

    const auctionInfo = {};

    switch (auctionType) {
      case "StrictDutchAuction":
        auctionInfo.initDist = fixedNumberToNumber(initTokens[0]);
      case "DutchAuction":
        auctionInfo.soldTokens = fixedNumberToNumber(soldProjectTokens[0]);
        auctionInfo.startingPrice = fixedNumberToNumber(rate[0]);
        auctionInfo.tokenDist = fixedNumberToNumber(currentSupply);
        auctionInfo.finalRate = fixedNumberToNumber(finalRate[0]);
        auctionInfo.currentPrice = fixedNumberToNumber(getCurrentRate[0]);
        break;
      case "OBFCFSAuction":
      case "FCFSAuction":
        auctionInfo.tokenDist = fixedNumberToNumber(
          numberOfTokensToBeDistributed[0]
        );
      case "UncappedAuction":
        auctionInfo.soldTokens = fixedNumberToNumber(soldProjectTokens[0]);
        auctionInfo.startingPrice = fixedNumberToNumber(rate[0]);
        break;
      case "PseudoCappedAuction":
        auctionInfo.tokenDist = fixedNumberToNumber(
          numberOfTokensToBeDistributed[0]
        );
        auctionInfo.currentPrice = fixedNumberToNumber(getCurrentRate[0]);
        auctionInfo.soldTokens = fixedNumberToNumber(soldProjectTokens[0]);
        break;
      case "OBDutchAuction":
        auctionInfo.tokenDist = fixedNumberToNumber(
          numberOfTokensToBeDistributed[0]
        );
        auctionInfo.soldTokens = fixedNumberToNumber(soldProjectTokens[0]);
        auctionInfo.minimumPrice = fixedNumberToNumber(minPrice[0]);
        auctionInfo.currentPrice = fixedNumberToNumber(getCurrentRate[0]);

        break;
    }

    auctionInfo.status = getStatus[0];

    console.log(auctionInfo, "Auction Info");

    if (fundLimitPerUser != null)
      auctionInfo.fundLimitPerUser = fixedNumberToNumber(fundLimitPerUser[0]);

    auctionInfo.startTime = startTime[0];
    auctionInfo.endTime = latestEndTime[0];
    auctionInfo.totalDeposit = fixedNumberToNumber(totalDepositedSucoins[0]);

    if (auctionInfo.status == 3) {
      setFinishTime(await getfinishTime(auctionContract));
    }

    setHistoricData(await getHistoricalData(auctionContract, auctionInfo));

    setCurrentData(auctionInfo);

    console.log("Current Data:", currentData);
  };

  const getfinishTime = async (auctionContract) => {
    //get log of AuctionFinishEvent
    const filter = auctionContract.filters.AuctionFinished();
    const logs = await auctionContract.queryFilter(filter);
    const log = logs.at(0);
    if (log != null) {
      const finishTime = await provider
        .getBlock(log.blockHash)
        .then((block) => block.timestamp * 1000);
      return finishTime;
    }
  };

  const getHistoricalData = async (auctionContract, auctionInfo) => {
    const {
      startTime,
      endTime,
      startingPrice,
      currentPrice,
      initDist,
      finalRate,
      minimumPrice,
      tokenDist,
      totalDeposit,
    } = auctionInfo;

    //TODO: TOO SLOW
    const bidFilter = auctionContract.filters.VariableChange();
    const bidEvents = await auctionContract.queryFilter(bidFilter);

    const timeStamps = Object.fromEntries(
      await Promise.all(
        bidEvents.map(async (bidEvent) => [
          bidEvent.blockNumber,
          (await provider.getBlock(bidEvent.blockNumber)).timestamp * 1000,
        ])
      )
    );

    const groupedMap = bidEvents.reduce(
      (entryMap, e) =>
        entryMap.set(e.args[0], [...(entryMap.get(e.args[0]) || []), e]),
      new Map()
    );

    Array.from(groupedMap.keys()).map((key) =>
      groupedMap.set(
        key,
        groupedMap
          .get(key)
          .reduce(
            (entryMap, e) =>
              entryMap.set(
                timeStamps[e.blockNumber],
                parseFloat(fixedNumberToNumber(e.args[1]))
              ),
            new Map()
          )
      )
    );

    if (state != 0) {
      groupedMap.set("currentRate", [
        [startTime * 1000, parseFloat(startingPrice ?? 0)],
        ...(groupedMap.get("currentRate") ?? []),
        [Math.min(new Date(), endTime * 1000), parseFloat(currentPrice)],
      ]);
      groupedMap.set("numberOfTokensToBeDistributed", [
        [startTime * 1000, parseFloat(initDist)],
        ...(groupedMap.get("numberOfTokensToBeDistributed") ?? []),
        [Math.min(new Date(), endTime * 1000), parseFloat(tokenDist)],
      ]);
      groupedMap.set("totalDepositedSucoins", [
        [startTime * 1000, parseFloat(0)],
        ...(groupedMap.get("totalDepositedSucoins") ?? []),
        [Math.min(new Date(), endTime * 1000), parseFloat(totalDeposit)],
      ]);
      groupedMap.set("minPrice", [
        [startTime * 1000, parseFloat(fixedNumberToNumber(1))],
        ...(groupedMap.get("minPrice") ?? []),
        [Math.min(new Date(), endTime * 1000), parseFloat(minimumPrice)],
      ]);
    }

    return groupedMap;
  };

  //

  const navigate = useNavigate();

  const variableChangeFilter = {
    address: auction,
    topics: [ethers.utils.id("VariableChange(string,uint256)")],
  };

  useEffect(() => {
    const fileSetup = async () => {
      const { abi } = await import(
        `../contracts_hardhat/artifacts/contracts/UpgradeableAuctions/${auctionType}.sol/${auctionType}.json`
      );
      const auctionContract = new ethers.Contract(auction, abi, provider);

      const imageResult = await getFileFromIpfs(state.fileHash, "image");
      setImageURL(URL.createObjectURL(imageResult.data));

      console.log("Project as state:", state);

      await refreshInfo(abi, auctionContract); //todo it would be better if backend did this

      provider.on(variableChangeFilter, (log, event) =>
        refreshInfo(abi, auctionContract)
      );

      setIsLoading(false);
    };
    fileSetup();
  }, []);

  const getCircularValue = (auctionStatus) => {
    switch (auctionStatus) {
      case 1:
      case 2: //Not really accurate
        return Math.round(
          Math.min(
            100,
            ((Date.now() / 1000 - startTime) / (endTime - startTime)) * 100
          )
        );

      case 3:
        return 100;
      default:
        return 0;
    }
  };

  const getFile = async () => {
    getFileFromIpfs(state.fileHash, "whitepaper").then((res) =>
      downloadFile(res.data)
    );

    const downloadFile = async (file) => {
      const reader = new FileReader();

      reader.readAsText(file);
      reader.onloadend = async () => {
        const data = window.URL.createObjectURL(file);
        const tempLink = await document.createElement("a");
        tempLink.href = data;
        tempLink.download = "Project_#" + state.projectID + ".pdf"; // some props receive from the component.
        tempLink.click();
      };
    };
  };

  return isLoading ? (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className="auction-detail-page">
          <LoadingIcon />
        </div>
      </NotificationsProvider>
    </MantineProvider>
  ) : (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className="auction-detail-page">
          <AuctionInfo
            projectId={projectId}
            auction={auction}
            tokenName={state.tokenName}
            price={currentData?.currentPrice ?? startingPrice}
            tokenDist={currentData?.tokenDist}
            deposit={currentData?.soldTokens}
            totalRaise={currentData?.totalDeposit}
            startingDate={currentData?.startTime}
            endingDate={currentData?.endTime}
            auctionType={auctionType}
            status={currentData?.status}
            limit={currentData?.fundLimitPerUser}
            projectImage={imageURL}
            rating={state.rating}
            projectName={state.projectName}
            projectDescription={state.projectDescription}
          />

          <div className="auction-info-row">
            <div className="auction-info-row-item">
              <div className="sectionName" style={{ textAlign: "center" }}>
                {"Auction Progress"}
              </div>
              <br />
              <div
                style={{
                  width: "60%",
                  margin: "auto",
                  fontFamily: "Montserrat",
                }}>
                <CircularProgressbar
                  value={getCircularValue(currentData?.status)}
                  text={
                    getCircularValue(currentData?.status) + "% time elapsed"
                  }
                  background={true}
                  backgroundPadding={6}
                  styles={{
                    path: {
                      // Path color
                      stroke: "#fff",
                    },

                    trail: {
                      // Trail color
                      stroke: "transparent",
                    },

                    text: {
                      // Text color
                      fill: "#fff",
                      // Text size
                      fontSize: "7.45",
                      // Text font
                      fontFamily: "Montserrat",
                    },

                    background: {
                      fill: "#173A6A",
                    },
                  }}
                />
              </div>
            </div>
            <div className="auction-info-row-item">
              <div className="sectionName" style={{ textAlign: "center" }}>
                {"Sold Token Progress"}
              </div>
              <br />
              <div style={{ width: "60%", margin: "auto" }}>
                <CircularProgressbar
                  value={(soldTokens / currentData.tokenDist) * 100}
                  text={
                    parseFloat((soldTokens / tokenDist) * 100).toFixed(2) + "%"
                  }
                  circleRatio={0.75}
                  styles={{
                    path: {
                      // Path color
                      stroke: "#173A6A",
                      // Rotate the path

                      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                      strokeLinecap: "butt",

                      transform: "rotate(0.625turn)",
                      transformOrigin: "center center",
                    },

                    trail: {
                      // Trail color
                      stroke: "#ddd",
                      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                      strokeLinecap: "butt",

                      transform: "rotate(0.625turn)",
                      transformOrigin: "center center",
                    },

                    text: {
                      // Text color
                      fill: "#173A6A",
                      // Text size
                      fontSize: "13",
                      // Text font rotation: 1 / 2 + 1 / 8,
                      fontFamily: "Montserrat",
                    },

                    background: {
                      fill: "#3e98c7",
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="auction-info-chart">
            {auctionTypesForChart.includes(auctionType) && currentData ? (
              <PriceChart
                currentData={currentData}
                historicData={historicData}
                auctionType={auctionType}
                finishTime={finishTime}
              />
            ) : null}
          </div>
        </div>
      </NotificationsProvider>
    </MantineProvider>
  );
};

export default Auction;
