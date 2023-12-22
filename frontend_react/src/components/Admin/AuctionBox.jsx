import { useState, useEffect } from "react";
import { getAuctionByStatusFromList } from "../Auctions";
import { Input, InputGroup, InputLeftElement, Button } from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons";
import { dotnetAPI } from "../../request/AxiosInterceptor";
import { useToast } from "@chakra-ui/react";
import { forceFinishAuction, pauseAuction } from "../../interactions/auction";

export default function AuctionBox({ auctions, selected }) {
  const [auctionedProjects, setAuctionedProjects] = useState([]);
  const [runningAuctions, setRunningAuctions] = useState([]);
  const [auctionList, setAuctionList] = useState([]);
  const [select, setSelect] = useState();
  const toast = useToast();

  useEffect(() => {
    dotnetAPI.get(`/Project/Get/All`).then((res) => {
      const proj = res.data.data;
      const sortedProjects = proj.sort((a, b) =>
        a.projectName.localeCompare(b.name)
      );
      const aucted = sortedProjects.filter((el) => {
        return el.isAuctionCreated;
      });
      setAuctionedProjects(aucted);

      //selected(sortedProjects.at(0))
      //auctioned(sortedProjects.filter((proj) => proj?.isAuctionCreated === true))
    });
  }, []);

  useEffect(() => {
    async function getAuctions() {
      console.log(auctionedProjects);
      if (auctionedProjects && auctionedProjects.length > 0) {
        const foundAuctions = await getAuctionByStatusFromList(
          1,
          auctionedProjects.length,
          auctionedProjects
        );
        setRunningAuctions(foundAuctions);
        setSelect(foundAuctions.at(0));
        if (foundAuctions) {
          setAuctionList(foundAuctions);
        }
      }
    }
    getAuctions();
  }, [auctionedProjects]);

  const handleSearchChange = (e) => {
    var aucL = [];
    const val = e.target.value.toLocaleLowerCase();
    if (val == "" || val == null) {
      setAuctionList(aucL);
      return;
    }
    runningAuctions.map((u) => {
      var name = u.projectName;
      if (name.toLocaleLowerCase().includes(val)) {
        aucL.push(u);
      }
    });
    setAuctionList(aucL);
  };
  const handleSelect = (e, auc) => {
    setSelect(auc);
  };

  const handleSuccess = async (success) => {
    if (success) {
      const filteredAuctions = runningAuctions.filter(
        (proj) => proj.projectID !== select.projectID
      );
      setRunningAuctions(filteredAuctions);
      setSelect(filteredAuctions.at(0));
    }
  };

  return (
    <div className="admin-box">
      <div className="admin-select-box">
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            color="white"
            fontSize="1.2em"
            children={<IconSearch />}
          />
          <Input
            color="white"
            placeholder="Search Auction"
            onChange={handleSearchChange}
          />
        </InputGroup>
        <div className="admin-scroll-box">
          {runningAuctions.map((auc) => (
            <button key={auc.projectID} onClick={(e) => handleSelect(e, auc)}>
              {auc.projectName}
            </button>
          ))}
        </div>
        {/*<Select onChange={handleChange}>
                    {auctions.map((proj) => ( 
                        <option key={proj.projectID} value={proj.fileHash}>
                            {proj.projectName}
                        </option>
                    ))}
                </Select>*/}
      </div>
      {select && (
        <div className="admin-info-box">
          <p className="info-name">{select.projectName}</p>
          <div className="info-field">
            <p className="info-field-name">Description:</p>
            <p className="info-value">{select.projectDescription}</p>
          </div>
          <div className="info-field">
            <p className="info-field-name">Auction Type:</p>
            <p className="info-value">{select.auctionType}</p>
          </div>
          <div className="info-field">
            <p className="info-field-name">Token Name:</p>
            <p className="info-value">{select.tokenName}</p>
          </div>
          <div className="info-field">
            <p className="info-field-name">Token Symbol:</p>
            <p className="info-value">{select.tokenSymbol}</p>
          </div>
          <div className="user-controls">
            <div className="user-controls-col">
              <Button
                onClick={() => pauseAuction(toast, select).then(handleSuccess)}
                colorScheme="red"
                variant="outline"
                size="lg">
                Pause Auction
              </Button>
            </div>
            <div className="user-controls-col">
              <Button
                onClick={() =>
                  forceFinishAuction(toast, select).then(handleSuccess)
                }
                colorScheme="red"
                variant="outline"
                size="lg">
                Force End Auction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
