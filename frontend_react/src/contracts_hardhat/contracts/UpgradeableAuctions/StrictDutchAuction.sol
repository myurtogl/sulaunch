pragma solidity ^0.8.17;
// SPDX-License-Identifier: MIT
import "./DutchAuction.sol";


/*
    This auction type is similar to dutch auction
    But the total supply also goes down by time
    from initial supply to 0 supply linearly
    Total supply can't go below soldTokens


    Auctions is finished when total supply is equal to soldTokens or time is up
    If there are tokens remaining when auction is finished they are burnt
*/

contract StrictDutchAuction is DutchAuction {

    uint public initTokens;

 
    function initialize(auctionParameters calldata params) public initializer override virtual {
        
        __CappedTokenAuction_init(params);

        __FCFSAuction_init_unchained(params);

        __DutchAuction_init_unchained(params);

        __StrictDutchAuction_init_unchained();
    }
    
    function __StrictDutchAuction_init_unchained() internal onlyInitializing{
        initTokens = numberOfTokensToBeDistributed;
    }


     function setCurrentRate() internal virtual override {
         super.setCurrentRate();

        //Also sets the current Supply


         uint tempSupply = getTotalSupply();

         if (tempSupply != numberOfTokensToBeDistributed) {
             emit VariableChange("numberOfTokensToBeDistributed", tempSupply);
            numberOfTokensToBeDistributed = tempSupply;
         }

       
    }

     //Also needs supply check
     //todo find a better way as setCurrentRate also calls getTotalSupply
   modifier stateUpdate() override{
        if (status == AuctionStatus.PAUSED  && block.timestamp >= variableStartTime)
            status = AuctionStatus.RUNNING;
        if (status == AuctionStatus.RUNNING && (block.timestamp >= latestEndTime || getTotalSupply() == soldProjectTokens))
            finalize();
        else
        _;
    }

    //Also needs supply check
    modifier quietStateUpdate() override {
        if (status == AuctionStatus.PAUSED  && block.timestamp >= variableStartTime)
            status = AuctionStatus.RUNNING;
        if (status == AuctionStatus.RUNNING && (block.timestamp >= latestEndTime || getTotalSupply() == soldProjectTokens))
            finalize();
        _;
          
    }


    

    function getTotalSupply() public view virtual returns(uint timeSupply) {
        uint duration = endTime - startTime;

        //Auction has not started yet
        if (startTime == 0)
            return initTokens;
        
        //Auction is finished
        else if (status == AuctionStatus.ENDED || block.timestamp >= latestEndTime)
            return soldProjectTokens;

        //Auction is paused
          else if (block.timestamp < variableStartTime)
            return numberOfTokensToBeDistributed;
        
        
        //Linear calculation for total supply
        uint timeTokens =  (initTokens - (initTokens) * (duration - (latestEndTime - block.timestamp))  /  (duration));
        //todo this calculation is buggy
        return timeTokens < soldProjectTokens ?  soldProjectTokens : timeTokens;
    }

    
    //Burn the remaining tokens instead of sending them to the projectWallet
      function finalize() internal override virtual{
        status = AuctionStatus.ENDED;

        uint remainingBalance = projectToken.balanceOf(address(this));
        if (remainingBalance != 0)
            projectToken.burn(remainingBalance);

        emit AuctionFinished(block.timestamp, currentRate);

    
    }

}

