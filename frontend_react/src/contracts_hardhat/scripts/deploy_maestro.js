const currentRegisterContract = "0xf31dDf7DfBEB775F9D387958c18a7423A06373d8";
const currentSucoin = "0x1994a7adac98dea914d260c4b7ff25225af220de";
let libAddress = "0x7C9A59A0aa7bAEe2f5F4ccfC25945cC14614f3f3";

async function deployMaestro(
  sucoinAddress,
  projectManagerAddress,
  wantedAuctionTypes = [
    "DutchAuction",
    "FCFSAuction",
    "OBDutchAuction",
    "OBFCFSAuction",
    "PseudoCappedAuction",
    "StrictDutchAuction",
    "UncappedAuction",
  ]
) {
  if (!libAddress) {
    const Lib = await ethers.getContractFactory(
      "BokkyPooBahsRedBlackTreeLibrary"
    );
    const lib = await Lib.deploy({
      gasPrice: ethers.utils.parseUnits("50.0", "gwei"),
    });
    await lib.deployed();
    libAddress = lib.address;
    console.log(libAddress);
  }

  const [deployer] = await ethers.getSigners();

  const baseNonce = await deployer.getTransactionCount();

  console.log("Deploying Maestro with the account:", deployer.address);

  const result = await Promise.all(
    wantedAuctionTypes.map(async (type) => {
      const Auction = await ethers.getContractFactory(
        type,
        type == "OBDutchAuction"
          ? {
              libraries: {
                BokkyPooBahsRedBlackTreeLibrary: libAddress,
              },
            }
          : {}
      );
      const auction = await Auction.deploy({
        gasPrice: ethers.utils.parseUnits("50.0", "gwei"),
        nonce: baseNonce + wantedAuctionTypes.indexOf(type),
      });
      await auction.deployed();
      console.log(type + " deployed to:", auction.address);
      return [type, auction.address];
    })
  );

  //Parse 2d array into 2 1d arrays
  const [auctionTypes, auctionAddresses] = [
    result.map((x) => x[0]),
    result.map((x) => x[1]),
  ];

  const Maestro = await ethers.getContractFactory("Maestro");
  const maestro = await Maestro.deploy(
    sucoinAddress,
    projectManagerAddress,
    auctionTypes,
    auctionAddresses
  );
  await maestro.deployed();
  return maestro.address;
}

deployMaestro(currentSucoin, currentRegisterContract)
  .then((address) => {
    console.log(`Maestro address is : ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
