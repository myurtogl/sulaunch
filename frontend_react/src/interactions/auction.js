import { ethers } from "ethers";
import Maestro from "../contracts_hardhat/artifacts/contracts/Maestro.sol/Maestro.json";
import { MaestroAddress } from "../config";

const maestro = { address: MaestroAddress };

export async function forceFinishAuction(toast, selected) {
  toast({
    title: "Trying to force finish running auction",
    description: "1 admin signs needed for finishing auction forcefully",
    status: "info",
    duration: 1000,
    isClosable: true,
  });

  try {
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const provider =
      window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
    const signer = await provider.getSigner();

    const MAESTRO = new ethers.Contract(maestro.address, Maestro.abi, signer);

    const registerTx = await MAESTRO.forceFinishAuction(
      "0x" + selected.fileHash
    );

    toast({
      title: "Pending transaction",
      description: "Transaction is pending...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    let receipt = await registerTx.wait();

    console.log("RESULT: ", receipt);
    if (typeof receipt !== "undefined") {
      //check blockhain if project is deleted

      toast({
        title: "Auction finished",
        description: "Auction is forcefully finished",
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      return true;
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}

export async function pauseAuction(toast, selected, time) {
  toast({
    title: "Trying to pause a running auction",
    description: "1 admin signs needed for pausing an auction",
    status: "info",
    duration: 1000,
    isClosable: true,
  });

  try {
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const provider =
      window.ethereum != null
        ? new ethers.providers.Web3Provider(window.ethereum)
        : ethers.providers.getDefaultProvider();
    const signer = await provider.getSigner();

    const MAESTRO = new ethers.Contract(maestro.address, Maestro.abi, signer);

    const registerTx = await MAESTRO.pauseAuction(
      "0x" + selected.fileHash,
      30 * 60
    );

    toast({
      title: "Pending transaction",
      description: "Transaction is pending...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    let receipt = await registerTx.wait();

    console.log("RESULT: ", receipt);
    if (typeof receipt !== "undefined") {
      //check blockhain if project is deleted

      toast({
        title: "Auction finished",
        description: "Auction is paused for 1 hours",
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      return true;
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}
