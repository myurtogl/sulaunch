pragma solidity ^0.8.17;
// SPDX-License-Identifier: MIT
import "./PseudoCappedAuction.sol";
//Liblary of tree for sorting and binary searching orders
import "../libraries/BokkyPooBahsRedBlackTreeLibrary.sol";

/*

    This auction type has specific amount of tokens to be auctioned.
    In this auction users can enter their price for each token when bidding
    Users can only  bid  once and it can't be removed.

    If there is more bids than tokens to be auctioned, then the bids are sorted by price.
    So lower bids may not get any tokens
    Lowest possible price is stored through the auction which may increase
    Users cannot bid below minimum price


    Auction ends when time is up.
    Token price will be the price where lowest price which can get tokens when sorted.
    Users can withdraw their tokens (or sucoins if their bid was below the minimum price)

    Gas cost wise this auction is not the best as it uses a lot of gas for sorting and storing bids
    But it is close to original dutch auction
    
    todo: add incremenets instead of increasing 1 increase by increment amount

*/

contract OBDutchAuction is CappedTokenAuction {

    uint public currentRate;
    //Tree for orderbook
    using BokkyPooBahsRedBlackTreeLibrary for BokkyPooBahsRedBlackTreeLibrary.Tree;
    address public proposerWallet;

    uint public fundLimitPerUser;

    uint public minPrice;

    uint public increment;
    //How many tokens are excessive on minimum price
    uint internal minPriceTokenCount;


    bool public soldExcessive = false;
   BokkyPooBahsRedBlackTreeLibrary.Tree private tree;


    //Keeps track of the  individual user bids and how full they are
    struct UserOrder{
        uint deposit;
        uint price;
        uint available;
    }

    //Keeps track of bids in a particular price
    struct PriceOrders {
        address[] userAddresses;
        uint totalWanted;
    }



    mapping(address => UserOrder) public UserOrders;
    mapping(uint => PriceOrders) public ordersForPrice;
   

    function initialize(auctionParameters calldata params)  override initializer public {
        __CappedTokenAuction_init(params);
        __OBDutchAuction_init_unchained(params);
    }

    function __OBDutchAuction_init_unchained(auctionParameters calldata params) internal onlyInitializing {
        projectWallet = address(this);
        require(params.rate > 0, "Rate cannot be 0");
        currentRate =  minPrice = params.rate;
        uint tempIncrement = currentRate / 10;

        increment = tempIncrement > 0 ? tempIncrement : 1;
        fundLimitPerUser = params.limit;
    }


    //Auction money does not go to the project wallet as bid reverts can happen
    //Instead it goes when people withdraw their tokens
    //todo Find a better way as there is a chance users never withdraw their tokens

    function setTeamWallet(address wallet) override external virtual onlyRole(PROPOSER_ADMIN_ROLE) {
        proposerWallet = wallet;
    }





    //Bid function with custom price 

    function bid(uint bidCoinBits,uint price)  external  virtual stateUpdate() isRunning()  {




         require(projectWallet != address(0),"Proposer wallet is not set");

         require(msg.sender != projectWallet,"Project wallet cannot bid");

         require(!hasRole(PROPOSER_ROLE,msg.sender),"Proposers cannot bid");


         require(bidCoinBits > 0, "You need to bid some coins");

        handleValidTimeBid(bidCoinBits,price);

        emit BidSubmission(msg.sender, bidCoinBits);

   


   
     }


     //Min price is chosen if user did not enter a custom bid price

     function handleValidTimeBid(uint bidCoinBits) internal virtual override {  
        handleValidTimeBid(bidCoinBits,minPrice);
    } 


    function setCurrentRate() internal virtual  {
        uint tempRate = getCurrentRate();
        if (tempRate != currentRate)
        {
            emit VariableChange("currentRate", tempRate);
            currentRate = tempRate;
        }
        
    }


    function handleValidTimeBid(uint bidCoinBits,uint price) internal virtual  { 

        


        require(price >= minPrice,"You need to enter a higher price");

        require(price % increment == 0, "Price must be a multiple of increment");

        

        UserOrder storage userOrder = UserOrders[msg.sender];

        require(userOrder.price == 0, "You have already bid");

        require(fundLimitPerUser == 0 || bidCoinBits <= fundLimitPerUser ,"You can't bid more than limit"); 



        userOrder.price = price;

        bidCoinBits =  handleRemainder(bidCoinBits, price);

        require(bidCoinBits > 0, "You need to put more bidcoins");

        swap(bidCoinBits);
    } 

    //Used to clear any bids below the minimum price when minimum price is updated
    function clearTree(uint tempRate) private {
        while(tree.first() != tempRate) {
                uint prevValue = tree.prev(tempRate);
                tree.remove(prevValue);
                delete ordersForPrice[prevValue];
            }
    }


    //Gets the price of the lowest bid which can get tokens when sorted (may change when new bids happen)
    //todo increment version?
    function getMinPrice(uint total) private returns(uint){
        uint value;

         for (value = tree.first(); total >= ordersForPrice[value].totalWanted; value = tree.next(value)) 
                    total -= ordersForPrice[value].totalWanted; 

        minPriceTokenCount = total;
        
         clearTree(value);
        return value + increment;
    }


    function tokenBuyLogic(uint bidCoinBits) internal virtual override {

            uint price =  UserOrders[msg.sender].price;
            UserOrders[msg.sender].deposit = bidCoinBits;
            PriceOrders storage orders = ordersForPrice[price];
            uint tempMinPrice = minPrice;

            //First bid for this price
            if (orders.userAddresses.length == 0) 
                tree.insert(price);
            

            //How many tokens wanted in this price
            orders.userAddresses.push(msg.sender);
            uint amount = convertPrice(bidCoinBits,address(projectToken)) / price;
            orders.totalWanted += amount;

            if (soldProjectTokens != numberOfTokensToBeDistributed) {
                //Less bids than total token count
                uint total = soldProjectTokens + amount;

                

                bool soldExcessiveTemp = total > numberOfTokensToBeDistributed;

                if (soldExcessiveTemp) {
                    soldExcessive = true;
                }

            
                
                //If with current order bids ar higher than total token count update minimum price
                if (soldExcessiveTemp || total == numberOfTokensToBeDistributed) 
                    tempMinPrice = getMinPrice(total - numberOfTokensToBeDistributed);

                //Sold project tokens can't be higher than number of tokens to be distributed
                soldProjectTokens = total >= numberOfTokensToBeDistributed ? numberOfTokensToBeDistributed : total;
                
                
            }
            else  {
                //All tokens are alaready bidded
                if (!soldExcessive)
                    soldExcessive = true;

                uint total = minPriceTokenCount + amount;
                tempMinPrice = getMinPrice(total);
                
            }

            //Emit event for frontend usage
            if (tempMinPrice != minPrice) {
                emit VariableChange("minPrice", tempMinPrice);
                minPrice = tempMinPrice;
            }

       
            totalDepositedSucoins += bidCoinBits;
            setCurrentRate();
        }

     

    
    //Last element in tree is the highest bid price which is what used as current rate
    function getCurrentRate() public virtual view  returns(uint current) {      //todo bad performance
        return tree.last();
    }


    //Withdrawal has 3 probabilities
    //1. Bid was above minimum bid - user uses all sucoins for getting tokens 
    //2. Bid was minimum bid - explained inside withdraw function
    //3. Bid was below minimum bid - user gets their sucoin refunded

    //Users can withdraw their tokens if the auction is finished

    function withDraw()  external quietStateUpdate() isFinished()  {    


        //This function may cause loss of some sucoins (owner gets more coins then needed)

        UserOrder storage userOrder = UserOrders[msg.sender];
        require(userOrder.deposit > 0,"You already withdrew or your token distributed already");

        uint price = userOrder.price;
        uint tokenAmount = convertPrice(userOrder.deposit,address(projectToken))  / price;

        bool allCanBuyAtMinPrice = minPriceTokenCount == 0;
        
        uint tempPrice = (allCanBuyAtMinPrice ? minPrice - increment : minPrice );

        uint absoluteMinimum = ((soldProjectTokens < numberOfTokensToBeDistributed) ? minPrice : minPrice - increment);



        uint cost =  revertPrice(tokenAmount * (absoluteMinimum),address(projectToken));
        



        //Higher or equal to minPrice gets the full order
        if (price >= tempPrice)   {

            //Send tokens
             projectToken.transfer(msg.sender,tokenAmount);

                 //Refund to user and remaining goes to proposer
             if (cost < userOrder.deposit) 
                 bidCoin.transfer(msg.sender, userOrder.deposit - cost);

             bidCoin.transfer(proposerWallet, cost);
            


         
        }

        //If users price is lower than minPrice - 1  they don't  get any tokens

        else if (price < absoluteMinimum) {
            bidCoin.transfer(msg.sender,userOrder.deposit);
        }


        //At min price -1 some get all the tokens  some get nothing while one person gets somewhat 
        else {
            uint availableToken = userOrder.available < tokenAmount ? userOrder.available : tokenAmount;

            if (allCanBuyAtMinPrice) {
                //This means everyone gets the tokens
                projectToken.transfer(msg.sender,tokenAmount);
                bidCoin.transfer(proposerWallet, userOrder.deposit);
            }

            
       
            

                //Not everyone gets the tokens
            else {

                if (availableToken != 0) {
                    //Send some amount of tokens to user
                    projectToken.transfer(msg.sender,availableToken);
                    bidCoin.transfer(proposerWallet,revertPrice(availableToken * (price),address(projectToken)));
                }


                if (availableToken != tokenAmount) 
                    //Refund some sucoins to user
                    bidCoin.transfer(msg.sender, revertPrice((tokenAmount - availableToken) * price,address(projectToken)));

            }
            

            }


        
        //Delete user order
        delete UserOrders[msg.sender];
      
    }

    function finalize() internal override{

        super.finalize();


        bool allCanBuyAtMinPrice = minPriceTokenCount == 0;
        uint tempPrice = allCanBuyAtMinPrice ? minPrice : minPrice - increment;

        //If minPriceTokenCount is 0  every remaining bidders gets their tokens
        if (!allCanBuyAtMinPrice) {
            //Distribute tokens to min bidders through their bidding time (earlier gets first)
            PriceOrders storage minOrders = ordersForPrice[tempPrice];

            //Remaining tokens for min bidders
            uint tempCount =  minOrders.totalWanted - minPriceTokenCount;

            address[] storage priceAddreses = minOrders.userAddresses;

            for (uint i = 0; i < priceAddreses.length; i++) {
                //Distribute tokens from the beginning
                UserOrder storage userOrder = UserOrders[priceAddreses[i]];
                uint wantedTokenAmount =  convertPrice(userOrder.deposit,address(projectToken)) / userOrder.price;

                //One person does not get full tokens instead he is refunded some of his bidcoin
                if (tempCount < wantedTokenAmount) {
                    userOrder.available = tempCount;
                    //Addresses after this address won't get any tokens
                    break;
                }

                //Get the full token amount without refund of bidcoin

                userOrder.available = wantedTokenAmount;
                tempCount -= wantedTokenAmount;
            }

            
        }

        uint remaining = numberOfTokensToBeDistributed - soldProjectTokens;
        if (remaining != 0) {
            //Distribute remaining tokens to the proposer
            projectToken.transfer(proposerWallet,remaining);
        }


        //Clear the remaining tree
        uint current;
        while((current = tree.first()) != 0) {
                tree.remove(current);
                delete ordersForPrice[current];
        }
        //Get current rate should return minPrice - increment
        tree.insert(tempPrice);

        emit AuctionFinished(block.timestamp, currentRate);
        
    }
}

