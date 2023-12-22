

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const {time} = require("@nomicfoundation/hardhat-network-helpers")
//get Clones from @openzeppelin/contracts



function numberToBigNumber(amount,decimal) {
    return BigNumber.from(10).pow(decimal).mul(amount)
}


function bigNumberToNumber(amount,decimal) {
    return amount.div(BigNumber.from(10).pow(decimal))
}


//Not working anymore because switching to proxy based auctions


describe("Auction cases", () => {         

    
    

    //Signers of test accounts
    let owner,user1,user2,user3

    //Addresses of test accounts
    let addrOwner,addr1,addr2,addr3


    //Sucoin info
    let sucoinDecimals,sucoinSupply,sucoin

    //Project Token info
    let projectTokenDecimals,projectTokenSupply,projectToken,projectTokenName,projectTokenSymbol


    let projectTokenLogic

    let obDutchAuctionLogic
    let obDutchAuction

    let clonesContract

    let biliraAddress

    let bilira
    
    let convertedSupply 

    let auctionRate, auctionLimit, auctionNumberOfTokensToBeDistributed, auctionFinalRate

    const resetAuction = async () => {


                auctionLimit = numberToBigNumber(100,projectTokenDecimals)

                auctionRate = numberToBigNumber(1,projectTokenDecimals)

                auctionNumberOfTokensToBeDistributed = numberToBigNumber(10,projectTokenDecimals)

                auctionFinalRate = 0

                //Deploy Bilira Token 
                const Bilira = await ethers.getContractFactory("Token");
                bilira = await Bilira.deploy("Bilira","BILIRA",convertedSupply,addrOwner);
                await bilira.deployed();
        
        
                biliraAddress = bilira.address
        
                //Deploy Sucoin Wrapper token to Bilira
                const Sucoin = await ethers.getContractFactory("WrapperToken");
                sucoin = await Sucoin.deploy("Sucoin","SC",biliraAddress);
        
        
                
        
        
                
        
        
        
                //convert 1000 bilira to sucoin
                await sucoin.deployed();
        
        
        
                //approve bilira to be used by sucoin
                await bilira.approve(sucoin.address,convertedSupply);
        
        
                await sucoin.depositFor(addrOwner,convertedSupply);
        
                //Clone project token
                const tx  = await clonesContract.clone(projectTokenLogic.address);
                const receipt = await tx.wait();
        
                const [tokenCloneEvent] = receipt.events;
        
                const {_to : tokenClone} = tokenCloneEvent.args;
                projectToken = await ethers.getContractAt("ERC20MintableBurnableUpgradeable",tokenClone);
        
                
        
                projectToken.initialize(projectTokenName,projectTokenSymbol,numberToBigNumber(projectTokenSupply,sucoinDecimals),addrOwner);
        
                
        
                //Clone auction
                const tx2 = await clonesContract.clone(obDutchAuctionLogic.address);
                const receipt2 = await tx2.wait();
                const [auctionCloneEvent] = receipt2.events;
        
                const {_to : auctionClone} = auctionCloneEvent.args;
                obDutchAuction = await ethers.getContractAt("OBDutchAuction",auctionClone);
        
        
        
        
        
                //Initialize the proxy and give user proposer permission
        
                await obDutchAuction.initialize({
                    token : projectToken.address,
                    bidCoin : sucoin.address,
                    limit : auctionLimit,
                    numberOfTokensToBeDistributed :  auctionNumberOfTokensToBeDistributed,
                    finalRate : auctionFinalRate,
                    rate : auctionRate
        
                });
        
        
                //Permision of being a proposer and adding other proposers
           
                const roleProposerTX = await obDutchAuction.grantRole(await obDutchAuction.PROPOSER_ROLE(), addrOwner);
                await roleProposerTX.wait();
        
        
        
        
        
                //Where the collected sucoins will go
                const txTeam = await obDutchAuction.setTeamWallet(addrOwner);
                await txTeam.wait();
        

                        //Handle Auction Token Amaount


                if (auctionNumberOfTokensToBeDistributed != 0) //Capped Auction
                    projectToken.mint(obDutchAuction.address,auctionNumberOfTokensToBeDistributed);   
         


              
                
        
        
                //start auction for 1000 seconds
                const txStart = await obDutchAuction.startAuction(1000);
                await txStart.wait();
        
    }



    
    before(async () => {
        [owner,user1,user2,user3,user4] = await ethers.getSigners();
        [addrOwner,addr1,addr2,addr3,addr4] = await Promise.all([owner,user1,user2,user3,user4].map(async (signer) => signer.getAddress()));

        sucoinDecimals = 18                                              //Default erc20 value
        projectTokenDecimals = 18

        sucoinSupply = 1000                                            //Supply when you ignore decimals , changeable for different tests
        projectTokenSupply = 100000
        projectTokenName = "Trial Token"
        projectTokenSymbol = "TRT"

        convertedSupply = numberToBigNumber(sucoinSupply,sucoinDecimals)





        //deploy  BokkyPooBahsRedBlackTreeLibrary
        const BokkyPooBahsRedBlackTreeLibrary = await ethers.getContractFactory("BokkyPooBahsRedBlackTreeLibrary");
        const bokkyPooBahsRedBlackTreeLibrary = await BokkyPooBahsRedBlackTreeLibrary.deploy();
        await bokkyPooBahsRedBlackTreeLibrary.deployed();


        const OBDutchAuction = await ethers.getContractFactory("OBDutchAuction",{
            libraries : {
                BokkyPooBahsRedBlackTreeLibrary : bokkyPooBahsRedBlackTreeLibrary.address
            }
        });
        obDutchAuctionLogic = await OBDutchAuction.deploy();
        await obDutchAuctionLogic.deployed();


        const ProjectToken = await ethers.getContractFactory("ERC20MintableBurnableUpgradeable");
        projectTokenLogic = await ProjectToken.deploy();
        await projectTokenLogic.deployed();




        const SimpleCloner = await ethers.getContractFactory("SimpleCloner");
        clonesContract = await SimpleCloner.deploy();
        await clonesContract.deployed();


        console.log("Auction resetted")









        


    })

    beforeEach(async () => {
       await resetAuction();




    })

    it ("Check if owner has correct amount of project token", async () => {
        expect(await projectToken.balanceOf(addrOwner)).to.equal(numberToBigNumber(projectTokenSupply,sucoinDecimals));
    })

    it ("Check if auction is correctly created", async () => {

        expect(await obDutchAuction.hasRole(await obDutchAuction.PROPOSER_ROLE(),addrOwner)).to.equal(true);
        expect(await obDutchAuction.hasRole(await obDutchAuction.PROPOSER_ADMIN_ROLE(),addrOwner)).to.equal(true);



        expect(await obDutchAuction.projectToken()).to.equal(projectToken.address);
        expect(await obDutchAuction.bidCoin()).to.equal(sucoin.address);
        expect(await obDutchAuction.fundLimitPerUser()).to.equal(auctionLimit);
        expect(await obDutchAuction.numberOfTokensToBeDistributed()).to.equal(auctionNumberOfTokensToBeDistributed);
        expect(await obDutchAuction.currentRate()).to.equal(auctionRate);
        expect(await obDutchAuction.proposerWallet()).to.equal(addrOwner);
        //check if status is started
        expect(await obDutchAuction.status()).to.equal(1);
        expect(await projectToken.balanceOf(obDutchAuction.address)).to.equal(auctionNumberOfTokensToBeDistributed);



    })

    //TODO : Proposer wallet changing can introduce vulnerabilities in the contract, make a stricter check as users can remove their proposer role and change the wallet to their own

    it ("Try to bid when proposer should fail", async () => {
        await expect(obDutchAuction.connect(owner)["bid(uint256)"](numberToBigNumber(10,sucoinDecimals))).to.be.revertedWith("Proposers cannot bid");
        await expect(obDutchAuction.connect(owner)["bid(uint256,uint256)"](numberToBigNumber(10,sucoinDecimals),0)).to.be.revertedWith("Proposers cannot bid");

    })

    it ("Bid without approval should fail", async () => {
        //transfer sucoins to addr1
        await sucoin.transfer(addr1,numberToBigNumber(100,sucoinDecimals));

        await expect(obDutchAuction.connect(user1)["bid(uint256)"](numberToBigNumber(10,sucoinDecimals))).to.be.revertedWith("Approved bid coin amount is not enough");
        await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](numberToBigNumber(10,sucoinDecimals),numberToBigNumber(1,sucoinDecimals))).to.be.revertedWith("Approved bid coin amount is not enough");

    })

    it ("Bid with approval but not enough balance should fail", async () => {
        //transfer sucoins to addr1
        await sucoin.transfer(addr1,numberToBigNumber(100,sucoinDecimals));
        //approve sucoins to be used by addr1
        await sucoin.connect(user1).approve(obDutchAuction.address,numberToBigNumber(1,sucoinDecimals));

        await expect(obDutchAuction.connect(user1)["bid(uint256)"](numberToBigNumber(10,sucoinDecimals))).to.be.revertedWith("Approved bid coin amount is not enough");
        await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](numberToBigNumber(10,sucoinDecimals),numberToBigNumber(1,sucoinDecimals))).to.be.revertedWith("Approved bid coin amount is not enough");

    })


    describe("Bid with approval and enough balance", async () => {
            
            beforeEach(async () => {
                await Promise.all([user1,user2,user3,user4].map(async (user) => {
                    await sucoin.transfer(user.address,numberToBigNumber(100,sucoinDecimals));
                    await sucoin.connect(user).approve(obDutchAuction.address,numberToBigNumber(100,sucoinDecimals));
                }))

            })

            it ("Biding 0 sucoins should fail", async () => {
                await expect(obDutchAuction.connect(user1)["bid(uint256)"](0)).to.be.revertedWith("You need to bid some coins");
                await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](0,0)).to.be.revertedWith("You need to bid some coins");

            })

            it ("Bidding price less than minPrice should fail", async () => {
                const minPrice = await obDutchAuction.minPrice();
                await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](numberToBigNumber(1,sucoinDecimals),minPrice.sub(1))).to.be.revertedWith("You need to enter a higher price");

            })

            it ("Bidding in non minPrice increment should fail", async () => {
                const minPrice = await obDutchAuction.minPrice();
                await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](numberToBigNumber(1,sucoinDecimals),minPrice.add(1))).to.be.revertedWith("Price must be a multiple of increment");

            })

            it ("Bidding in minPrice increment should succeed", async () => {
                const minPrice = await obDutchAuction.minPrice();
                const increment = minPrice.div(10);
                await expect(obDutchAuction.connect(user1)["bid(uint256,uint256)"](numberToBigNumber(1,sucoinDecimals),minPrice.add(increment.mul(45)))).to.not.be.reverted;

            })

            describe("Min Price tests", async () => {
                let minPrice;
                let convertedMinPrice;
                let increment;
                
                before(async () => {
                    minPrice =  await obDutchAuction.minPrice();
                    convertedMinPrice = bigNumberToNumber(minPrice,sucoinDecimals);
                    increment = minPrice.div(10);


                })

                it ("Min price is correct", async () => {
                    expect(minPrice).to.equal(auctionRate);
                })

   

                describe("If total bid amount  from the minprice is less than number of tokens to be distributed, min price should not change", async () => {
                    it ("Single bid", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).sub(1).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount,minPrice);
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice);

                    })

                    it ("Multiple bids", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).sub(1).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);
                        await obDutchAuction.connect(user2)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice);

                    })

                })

                describe("If total bid amount from the minprice is equal to number of tokens to be distributed, min price should increase by price + incrememnt amount", async () => {
                    it ("Single bid", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount,minPrice);
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.add(increment));

                    })

                    it ("Single bid higher than min price", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount.mul(2),minPrice.mul(2));
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.mul(2).add(increment));
                    })

                    it ("Multiple bids", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);
                        await obDutchAuction.connect(user2)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);

                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.add(increment));

                    })

                    it ("Multiple bids higher than min price", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount,minPrice.mul(2));
                        await obDutchAuction.connect(user2)["bid(uint256,uint256)"](totalBidAmount,minPrice.mul(2));
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.mul(2).add(increment));
                    })



                })

                describe("If total bid amount from the minprice is more than number of tokens to be distributed, min price should increase by price + incrememnt amount", async () => {
                    it ("Single bid", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).add(1).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount,minPrice);
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.add(increment));

                    })

                    it ("Single bid higher than min price", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).add(1).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount.mul(2),minPrice.mul(2));
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.mul(2).add(increment));
                    })

                    it ("Multiple bids", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).add(2).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);
                        await obDutchAuction.connect(user2)["bid(uint256,uint256)"](totalBidAmount.div(2),minPrice);

                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.add(increment));

                    })

                    it ("Multiple bids higher than min price", async () => {
                        const totalBidAmount = (await obDutchAuction.numberOfTokensToBeDistributed()).add(2).mul(convertedMinPrice);
                        await obDutchAuction.connect(user1)["bid(uint256,uint256)"](totalBidAmount,minPrice.mul(2));
                        await obDutchAuction.connect(user2)["bid(uint256,uint256)"](totalBidAmount,minPrice.mul(2));
                        expect(await obDutchAuction.minPrice()).to.equal(minPrice.mul(2).add(increment));
                    })

                })



                


            })

            describe("currentRate tests", async () => {
                let increment;
                let minPrice;

                before(async () => {
                    increment = await obDutchAuction.increment();
                    minPrice = await obDutchAuction.minPrice();
                })


                it ("currentRate should be equal to minPrice at the beginning", async () => {
                    expect(await obDutchAuction.currentRate()).to.equal(await obDutchAuction.minPrice());
                })

                it ("currentRate should take the highest bid price", async () => {

                    let price = minPrice.add(increment);

                    await obDutchAuction.connect(user1)["bid(uint256,uint256)"](price,price);
                    expect(await obDutchAuction.currentRate()).to.equal(price)
                    
                    price = price.add(increment);

                    await obDutchAuction.connect(user2)["bid(uint256,uint256)"](price,price);

                    expect(await obDutchAuction.currentRate()).to.equal(price)

                    await obDutchAuction.connect(user3)["bid(uint256,uint256)"](price.mul(10),price.mul(10));
                    expect(await obDutchAuction.currentRate()).to.equal(price.mul(10))



                })
            })

            describe("finalize tests", async () => {
                it ("should revert if finalize is called before auction end time", async () => {
                    await expect(obDutchAuction.manualFinish()).to.be.revertedWith("Auction has not finished yet");

                    expect (await obDutchAuction.status()).to.equal(1);

                })

                it ("should complete auction if finalize is called after auction end time", async () => {
                    await time.increase(86400);


                    await obDutchAuction.manualFinish();




                })


                describe("Auction finalizes with no bids", async () => {

                    let proposerTotalTokens;


                    beforeEach(async () => {
                        await time.increase(86400);
                        const totalNumberOfTokens = await obDutchAuction.numberOfTokensToBeDistributed();
                        proposerTotalTokens = await projectToken.balanceOf(addrOwner);

                        await obDutchAuction.manualFinish();
                    })

 

                    it ("proposer must receive the total amount of tokens", async () => {
                        expect(await projectToken.balanceOf(obDutchAuction.address)).to.equal(0);
                        expect(await projectToken.balanceOf(addrOwner)).to.equal(proposerTotalTokens.add(auctionNumberOfTokensToBeDistributed));
                    })

                })

                describe("Auction finalizes with bids", async () => {

                    describe("Auction finalizes without exceeding the number of tokens to be distributed", async () => {

         
                        let minPrice;

                        let initialSucoinBalance;

                        before (async () => {
                            initialSucoinBalance = await sucoin.balanceOf(addrOwner);
                        })

                        beforeEach(async () => {

                            proposerTotalTokens = await projectToken.balanceOf(addrOwner);

                            user1TotalTokens = await projectToken.balanceOf(addr1);
                            user2TotalTokens = await projectToken.balanceOf(addr2);

                            user3TotalTokens = await projectToken.balanceOf(addr3);

                            minPrice = await obDutchAuction.minPrice();




                            

                            await obDutchAuction.connect(user1)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed,minPrice.mul(2));
                            await obDutchAuction.connect(user2)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(4),minPrice);
                            await obDutchAuction.connect(user3)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(4),minPrice);


                            await time.increase(86400);


                            await obDutchAuction.manualFinish();
                        })

                
 

                        it ("proposer must not  receive the any tokens or sucoins yet", async () => {
                            expect(await sucoin.balanceOf(addrOwner)).to.equal(initialSucoinBalance);
                            expect(await projectToken.balanceOf(addrOwner)).to.equal(numberToBigNumber(projectTokenSupply,sucoinDecimals));
                        })

                        describe ("all users withdraw" , async () => {

                            let initOwnerSucoinBalance;
    
                        
                            
                            beforeEach(async () => {
                                initOwnerSucoinBalance = await sucoin.balanceOf(owner.address);

                                await Promise.all([user1,user2,user3].map(
                                    async (user,index) => {
    
                                        const userContract = await obDutchAuction.connect(user);
                                        await expect(userContract.withDraw()).to.be.not.reverted;
    
    
                                    }
                                ))  
                            })
    
                            it ("contract should not have any remaining sucoins", async () => {
                                expect(await sucoin.balanceOf(obDutchAuction.address)).to.equal(0);
                            })
    
                            it ("owner must receive soldTokens times minimum token sell price", async () => {
                                let numberOfTokensSold = await obDutchAuction.soldProjectTokens();
                                let minPrice = await obDutchAuction.minPrice();
                                let increment = auctionRate.div(10)
    
                          
                                const absoluteMinPrice = numberOfTokensSold < auctionNumberOfTokensToBeDistributed ? minPrice : minPrice.sub(increment);
    
                                const convertedAbsolute = BigNumber.from(bigNumberToNumber(absoluteMinPrice,sucoinDecimals))                  
    
                                
                                expect(await sucoin.balanceOf(owner.address)).to.equal(initOwnerSucoinBalance.add(numberOfTokensSold.mul(convertedAbsolute)));
    
                                
    
    
                            })
    
    
    
                        })

                })

                describe("Auction finalizes with exceeding the number of tokens to be distributed", async () => {

                    describe("Every bidder on different price", async () => {

                        let user1SucoinBalance;
                        let previousUser1SucoinBalance;

                        let user2SucoinBalance;
                        let previousUser2SucoinBalance;

                        let user3SucoinBalance;
                        let previousUser3SucoinBalance;

                        let minPrice;

                        beforeEach(async () => {
                            previousUser1SucoinBalance = await sucoin.balanceOf(user1.address);
                            previousUser2SucoinBalance = await sucoin.balanceOf(user2.address);
                            previousUser3SucoinBalance = await sucoin.balanceOf(user3.address);

                            
                            minPrice = await obDutchAuction.minPrice();
                        })


             

                        describe("highest bidder overwrites  both second and third highest bidder", async () => {


                            beforeEach(async () => {

  
                                    
                                    
    
                                   
                                    await obDutchAuction.connect(user1)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(2),minPrice);
                                    await obDutchAuction.connect(user2)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(4),(minPrice.mul(2)).toString());
                                    await obDutchAuction.connect(user3)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.mul(3),(minPrice.mul(3)).toString());



                                    user1SucoinBalance = await sucoin.balanceOf(user1.address);
                                    user2SucoinBalance = await sucoin.balanceOf(user2.address);
                                    user3SucoinBalance = await sucoin.balanceOf(user3.address);





                                    await time.increase(86400);


                                    await obDutchAuction.manualFinish();



                            })

                            describe ("all users withdraw" , async () => {

                                let initOwnerSucoinBalance;
        
                             
                                
                                beforeEach(async () => {
                                    initOwnerSucoinBalance = await sucoin.balanceOf(owner.address);

                                    await Promise.all([user1,user2,user3].map(
                                        async (user,index) => {
        
                                            const userContract = await obDutchAuction.connect(user);
                                            await expect(userContract.withDraw()).to.be.not.reverted;
        
        
                                        }
                                    ))  
                                })
        
                                it ("contract should not have any remaining sucoins", async () => {
                                    expect(await sucoin.balanceOf(obDutchAuction.address)).to.equal(0);
                                })
        
                                it ("owner must receive soldTokens times minimum token sell price", async () => {
                                    let numberOfTokensSold = await obDutchAuction.soldProjectTokens();
                                    let minPrice = await obDutchAuction.minPrice();
                                    let increment = auctionRate.div(10)
        
                              
                                    const absoluteMinPrice = numberOfTokensSold < auctionNumberOfTokensToBeDistributed ? minPrice : minPrice.sub(increment);
        
                                    const convertedAbsolute = BigNumber.from(bigNumberToNumber(absoluteMinPrice,sucoinDecimals))                  
        
                                    
                                    expect(await sucoin.balanceOf(owner.address)).to.equal(initOwnerSucoinBalance.add(numberOfTokensSold.mul(convertedAbsolute)));
        
                                    
        
        
                                })
        
        
        
                            })

                            it ("highest bidder must receive all tokens after withdraw", async () => {

                                expect(await projectToken.balanceOf(user3.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user3.address)).to.equal(auctionNumberOfTokensToBeDistributed);
                            })

                         

                            it ("other bidders must receive 0 tokens after withdraw", async () => {
                                expect(await projectToken.balanceOf(user2.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user2.address)).to.equal(0);

                                expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                            })


                            it ("highest bidder should not receive  any sucoin refund after withdraw", async () => {
                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance);

                                await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;

                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance);
                            })

                            it ("other bidders must receive full sucoin refund after withdraw", async () => {
                                expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user1.address)).to.equal(previousUser1SucoinBalance);

                                expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance);
                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user2.address)).to.equal(previousUser2SucoinBalance);
                              
                            })

                                
                               
                        })

                        describe("highest bidder overwrites  third highest bidder", async () => {

                            beforeEach(async () => {
                                await obDutchAuction.connect(user1)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(2),minPrice);

                                await obDutchAuction.connect(user2)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed,(minPrice.mul(2)).toString());

                                await obDutchAuction.connect(user3)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.mul(2),(minPrice.mul(4)).toString());

    
    
    
                                user1SucoinBalance = await sucoin.balanceOf(user1.address);
                                user2SucoinBalance = await sucoin.balanceOf(user2.address);
                                user3SucoinBalance = await sucoin.balanceOf(user3.address);

    
    
    
    
    
                                await time.increase(86400);
    
    
                                await obDutchAuction.manualFinish();
                            })


                            describe ("all users withdraw" , async () => {

                                let initOwnerSucoinBalance;
        
                                                           
                                
                                beforeEach(async () => {
                                    initOwnerSucoinBalance = await sucoin.balanceOf(owner.address);

                                    await Promise.all([user1,user2,user3].map(
                                        async (user,index) => {
        
                                            const userContract = await obDutchAuction.connect(user);
                                            await expect(userContract.withDraw()).to.be.not.reverted;
        
        
                                        }
                                    ))  
                                })
        
                                it ("contract should not have any remaining sucoins", async () => {
                                    expect(await sucoin.balanceOf(obDutchAuction.address)).to.equal(0);
                                })
        
                                it ("owner must receive soldTokens times minimum token sell price", async () => {
                                    let numberOfTokensSold = await obDutchAuction.soldProjectTokens();
                                    let minPrice = await obDutchAuction.minPrice();
                                    let increment = auctionRate.div(10)
        
                              
                                    const absoluteMinPrice = numberOfTokensSold < auctionNumberOfTokensToBeDistributed ? minPrice : minPrice.sub(increment);
        
                                    const convertedAbsolute = BigNumber.from(bigNumberToNumber(absoluteMinPrice,sucoinDecimals))                  
        
                                    
                                    expect(await sucoin.balanceOf(owner.address)).to.equal(initOwnerSucoinBalance.add(numberOfTokensSold.mul(convertedAbsolute)));
        
                                    
        
        
                                })
        
        
        
                            })

                            it ("second highest bidder must receive half the  tokens after withdraw", async () => {
                                expect(await projectToken.balanceOf(user2.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user2.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(2));
                            })

       
                            it ("highest bidder must receive half tokens after withdraw", async () => {
                                expect(await projectToken.balanceOf(user3.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user3.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(2));
                            })
                            


                            it ("third highest bidder must receive 0 tokens after withdraw", async () => {
                                expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                            })

                            it ("highest bidder must receive sucoin refund based on bid price vs second highest bidder", async () => {
                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance);
                                await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance.add(previousUser3SucoinBalance.sub(user3SucoinBalance).div(2)));
                            })



                            

                            it ("second highest bidder should not receive  any sucoin refund after withdraw", async () => {
                                expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance);

                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;

                                expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance);
                            })

                            it ("third highest bidder must receive full sucoin refund after withdraw", async () => {
                                expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user1.address)).to.equal(previousUser1SucoinBalance);
                            })





                                                               



                            

                        })

                        describe("highest bidder overwrites third highest bidder partially", async () => {
                            beforeEach(async () => {

                                await obDutchAuction.connect(user1)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(2),minPrice);


                                await obDutchAuction.connect(user2)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed,(minPrice.mul(2)).toString());


                                await obDutchAuction.connect(user3)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed,(minPrice.mul(4)).toString());


    
    
    
                                user1SucoinBalance = await sucoin.balanceOf(user1.address);
                                user2SucoinBalance = await sucoin.balanceOf(user2.address);
                                user3SucoinBalance = await sucoin.balanceOf(user3.address);

    
    
    
    
    
                                await time.increase(86400);
    
    
                                await obDutchAuction.manualFinish();
                            })

                            

                            describe ("all users withdraw" , async () => {

                                let initOwnerSucoinBalance;
        
                      
                                
                                beforeEach(async () => {
                                    initOwnerSucoinBalance = await sucoin.balanceOf(owner.address);

                                    await Promise.all([user1,user2,user3].map(
                                        async (user,index) => {
        
                                            const userContract = await obDutchAuction.connect(user);
                                            await expect(userContract.withDraw()).to.be.not.reverted;
        
        
                                        }
                                    ))  
                                })
        
                                it ("contract should not have any remaining sucoins", async () => {
                                    expect(await sucoin.balanceOf(obDutchAuction.address)).to.equal(0);
                                })
        
                                it ("owner must receive soldTokens times minimum token sell price", async () => {
                                    let numberOfTokensSold = await obDutchAuction.soldProjectTokens();
                                    let minPrice = await obDutchAuction.minPrice();
                                    let increment = auctionRate.div(10)
        
                              
                                    const absoluteMinPrice = numberOfTokensSold < auctionNumberOfTokensToBeDistributed ? minPrice : minPrice.sub(increment);
        
                                    const convertedAbsolute = BigNumber.from(bigNumberToNumber(absoluteMinPrice,sucoinDecimals))                
                                    


        
                                    
                                    expect(await sucoin.balanceOf(owner.address)).to.equal(initOwnerSucoinBalance.add(numberOfTokensSold.mul(convertedAbsolute)));
        
                                    
        
        
                                })
        
        
        
                            })

                            it ("second highest bidder must receive half the  tokens after withdraw", async () => {
                                expect(await projectToken.balanceOf(user2.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                                expect(await projectToken.balanceOf(user2.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(2));
                            })

                            it ("third highest bidder must receive quarter tokens after withdraw", async () => {



                                expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;

                                expect(await projectToken.balanceOf(user1.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(4));
                            })

                            it ("third highest bitter must be refunded of 1/2 sucoin", async () => {

                                
                                expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance);
                                await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(4)));
                            })


                            it ("highest bidder must be refunded 3/4 sucoin", async () => {
                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance);
                                await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(4).mul(3)));
                            })

                            it ("second highest bidder must receive 1/2 sucoin refund", async () => {
                                expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance);
                                await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                                expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(2)));
                            })

                        })


                            
                })

                describe ("bidders can be at same price", async () => {

                    let minPrice;

                        
    
    
                    let user1SucoinBalance
                    let user2SucoinBalance 
                    let user3SucoinBalance
                    let user4SucoinBalance


                    beforeEach (async () => {
                        minPrice = await obDutchAuction.minPrice();
                    })



                    describe("bidders at same price overwrites each other", async () => {
                        beforeEach(async () => {

                            await obDutchAuction.connect(user1)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(2),minPrice.mul(2).toString());
                            await obDutchAuction.connect(user2)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed,minPrice.mul(2).toString());
                            await obDutchAuction.connect(user3)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.div(4),minPrice.mul(2).toString());

                            await obDutchAuction.connect(user4)["bid(uint256,uint256)"](auctionNumberOfTokensToBeDistributed.mul(3).div(2),minPrice.mul(3).toString());

                                
    
    
                            user1SucoinBalance = await sucoin.balanceOf(user1.address);
                            user2SucoinBalance = await sucoin.balanceOf(user2.address);
                            user3SucoinBalance = await sucoin.balanceOf(user3.address);
                            user4SucoinBalance = await sucoin.balanceOf(user4.address);


                            await time.increase(86400);
    
    
                            await obDutchAuction.manualFinish();



                        })

                        

                        it ("users must be able to withdraw to get all tokens", async () => {


                             await Promise.all([user1,user2,user3,user4].map(
                                  async (user,index) => {

                                      const userContract = await obDutchAuction.connect(user);
                                      await expect(userContract.withDraw()).to.be.not.reverted;


                                  }
                              ))  

                            
                      })

                      describe ("all users withdraw" , async () => {

                        let initOwnerSucoinBalance;

                        beforeEach(async () => {
                            initOwnerSucoinBalance = await sucoin.balanceOf(owner.address);

                            await Promise.all([user1,user2,user3,user4].map(
                                async (user,index) => {

                                    const userContract = await obDutchAuction.connect(user);
                                    await expect(userContract.withDraw()).to.be.not.reverted;


                                }
                            ))  
                        })

                        it ("contract should not have any remaining sucoins", async () => {
                            expect(await sucoin.balanceOf(obDutchAuction.address)).to.equal(0);
                        })

                        it ("owner must receive soldTokens times minimum token sell price", async () => {
                            let numberOfTokensSold = await obDutchAuction.soldProjectTokens();
                            let minPrice = await obDutchAuction.minPrice();
                            let increment = auctionRate.div(10)

                      
                            const absoluteMinPrice = numberOfTokensSold < auctionNumberOfTokensToBeDistributed ? minPrice : minPrice.sub(increment);

                            const convertedAbsolute = BigNumber.from(bigNumberToNumber(absoluteMinPrice,sucoinDecimals))                  

                            
                            expect(await sucoin.balanceOf(owner.address)).to.equal(initOwnerSucoinBalance.add(numberOfTokensSold.mul(convertedAbsolute)));

                            


                        })



                    })

                    it ("highest bidder must receive all bought tokens after withdraw", async () => {
                        expect(await projectToken.balanceOf(user4.address)).to.equal(0);
                        await expect(obDutchAuction.connect(user4).withDraw()).to.be.not.reverted;
                        expect(await projectToken.balanceOf(user4.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(2));
                    })

                    it ("highest bidder must receive some refund depending on minimum bid", async () => {
                        expect(await sucoin.balanceOf(user4.address)).to.equal(user4SucoinBalance);
                        await expect(obDutchAuction.connect(user4).withDraw()).to.be.not.reverted;
                        expect(await sucoin.balanceOf(user4.address)).to.equal(user4SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(2)));
                    })




                      it ("first bidder of  less price must receive all bought tokens after withdraw", async () =>  {
                        expect(await projectToken.balanceOf(user1.address)).to.equal(0);
                        await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                        expect(await projectToken.balanceOf(user1.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(4));
                            

                    })

                    it ("first bidder must not be refunded any sucoin", async () => {
                        expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance);
                        await expect(obDutchAuction.connect(user1).withDraw()).to.be.not.reverted;
                        expect(await sucoin.balanceOf(user1.address)).to.equal(user1SucoinBalance);
                    })

                    it ("second  bidder of less price must receive half of his bought tokens after withdraw", async () => {

                        expect(await projectToken.balanceOf(user2.address)).to.equal(0);
                        await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                        expect(await projectToken.balanceOf(user2.address)).to.equal(auctionNumberOfTokensToBeDistributed.div(4));
                    })

                    it ("second bidder refuned 1/2 of his bidded sucoin", async () => {
                        expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance);
                        await expect(obDutchAuction.connect(user2).withDraw()).to.be.not.reverted;
                        expect(await sucoin.balanceOf(user2.address)).to.equal(user2SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(2)));
                    })

                    it ("last bidder of less price must not receive any tokens after withdraw", async () => {

                        expect(await projectToken.balanceOf(user3.address)).to.equal(0);
                        await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                        expect(await projectToken.balanceOf(user3.address)).to.equal(0);
                    })


                    it ("last bidder refunded all of bided sucoin", async () => {
                            
                            expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance);
                            await expect(obDutchAuction.connect(user3).withDraw()).to.be.not.reverted;
                            expect(await sucoin.balanceOf(user3.address)).to.equal(user3SucoinBalance.add(auctionNumberOfTokensToBeDistributed.div(4)));
                    })

                    




                    

                })

            })

        })

    })

})

    })
})
  

 