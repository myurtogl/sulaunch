// import { Grid,GridItem,Button,useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react";
// import { deleteProject } from "../../interactions/project";
import { getAuctionByStatusFromList } from "../Auctions";
// import AuctionBox from "./AuctionBox";
// import AuctionCard from "./AuctionCard";
// import { forceFinishAuction ,pauseAuction} from "../../interactions/auction";

export default function Project() {
    const toast = useToast();
    const [selectedProject, setSelectedProject] = useState(null);
    const [auctionedProjects, setAuctionedProjects] = useState([]);

    const [selectedAuction, setSelectedAuction] = useState(null);
    const [runningAuctions, setRunningAuctions] = useState([]);

    useEffect(() => {
        async function getAuctions() {
            if (auctionedProjects && auctionedProjects.length > 0) {
                const foundAuctions = await getAuctionByStatusFromList(
                    1,
                    auctionedProjects.length,
                    auctionedProjects
                );

                setRunningAuctions(foundAuctions);

                if (foundAuctions) {
                    setSelectedAuction(foundAuctions.at(0));
                }
            }
        }
        getAuctions();
    }, [auctionedProjects]);

    return (
        <Grid templateColumns="repeat(5, 1fr)" gap={6} columnGap={20}>
            <GridItem colSpan={2} alignContent={"center"}></GridItem>

            {/*selectedProject && 
      <>
            <GridItem colSpan={3} justifySelf={"center"} alignSelf={"center"}>
              <Grid colSpan={3} templateColumns='repeat(3, 1fr)' gap={6} justifyItems={"center"} alignItems={"center"}>
                <GridItem colSpan={1} alignItems={"center"}>
                  <Button onClick={() => deleteProject(toast,selectedProject)}  disabled={selectedProject.isAuctionCreated} colorScheme="red" variant="outline" size="lg" >Delete Project</Button>
                </GridItem>
              </Grid>
                  
                
            </GridItem>
      </>
    */}
            {/* 
      <GridItem colSpan={2} alignContent={"center"}>
        <AuctionBox selected={setSelectedAuction} auctions={runningAuctions}/>
        <AuctionCard selected={selectedAuction}/>
      </GridItem>

      {selectedAuction && 
      <>
    

            <GridItem colSpan={3} justifySelf={"center"} alignSelf={"center"}>
              <Grid colSpan={3} templateColumns='repeat(3, 1fr)' gap={6} justifyItems={"center"} alignItems={"center"}>

     

                <GridItem colSpan={1} alignItems={"center"}>
                  <Button onClick={() => pauseAuction(toast,selectedAuction)}  colorScheme="red" variant="outline" size="lg" >Pause Auction </Button>
                </GridItem>

                <GridItem colSpan={1} alignItems={"center"}>
                  <Button onClick={() => forceFinishAuction(toast,selectedAuction)} colorScheme="red" variant="outline" size="lg" >Force End Auction </Button>
                </GridItem>


                

     

              </Grid>
                  
                
            </GridItem>
      </>
     

           
      }*/}
        </Grid>
    );
}
