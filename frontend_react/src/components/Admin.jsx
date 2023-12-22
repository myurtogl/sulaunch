import { Tabs, TabList, TabPanels, Tab, TabPanel,Grid, GridItem, Button, useToast ,Text, Center} from '@chakra-ui/react'
import { useRef, useState } from 'react';
import UserBox from './Admin/UserBox';
import ProjectBox from './Admin/ProjectBox';
import AuctionBox from './Admin/AuctionBox';





export default function Admin() {

  const [selected, setSelected] = useState(null);
  const toast = useToast();

  return (
    <div className='admin'>
      <Tabs>
        <TabList>
          <Tab >User Operations</Tab>
          <Tab>Project Operations</Tab>
          <Tab>Auction Operations</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <UserBox selected={setSelected}/>
            {/*<Grid templateColumns='repeat(5, 1fr)' gap={6} columnGap={20}>

              <GridItem colSpan={2} alignContent={"center"}>
                
                <UserCard selected={selected}/>
              </GridItem>

              {selected && 
              <>
                    <GridItem colSpan={3} justifySelf={"center"} alignSelf={"center"}>
                      <Grid colSpan={3} templateColumns='repeat(3, 1fr)' gap={6} justifyItems={"center"} alignItems={"center"}>
                        <GridItem colSpan={1} alignItems={"center"}>
                          <PromotionBox selected={selected}/>
                        </GridItem>
                        <GridItem colSpan={1} alignItems={"center"}>
                          <Button onClick={() => deleteUser(toast,selected).then(deleted =>  setDeletedUser(deleted ? selected?.id : null))} colorScheme="red" variant="outline" size="lg" >Delete User</Button>
                        </GridItem>
                        <GridItem colSpan={1} alignItems={"center"}>
                          <Button  onClick={() => promoteUserToAdmin(toast,selected)} colorScheme="green" variant="outline" size="lg" > Promote to Admin</Button>
                        </GridItem>
                      </Grid>
                    </GridItem>
              </>
              }
            </Grid>*/}
          </TabPanel>
          <TabPanel>
            <ProjectBox/>
          </TabPanel>
          <TabPanel>
            <AuctionBox />
          </TabPanel>
            
        </TabPanels>
      </Tabs>
    </div>
  );
}