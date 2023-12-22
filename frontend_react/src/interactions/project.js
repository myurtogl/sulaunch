import { ethers } from "ethers";
import ethersAbi from "../contracts_hardhat/artifacts/contracts/ProjectRegister.sol/ProjectRegister.json";
import { ProjectRegisterAddress } from "../config";
import { dotnetAPI } from "../request/AxiosInterceptor";

export async function deleteProject(toast, selected) {
  toast({
    title: "Trying to delete a project",
    description: "2 admin signs needed for deleting a project",
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

    const registerContract = await new ethers.Contract(
      ProjectRegisterAddress,
      ethersAbi.abi,
      signer
    );

    const registerTx = await registerContract.removeProject(
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
      const project = await registerContract.projectsRegistered(
        "0x" + selected.fileHash
      );

      console.log("RESULT: ", project);

      const bcResult = project?.at(2);

      console.log("RESULT: ", bcResult);

      if (bcResult && Number(bcResult) === 0) {
        //delete project from database
        await dotnetAPI.delete(`/Project/Delete/${selected.projectID}`);

        toast({
          title: "Project deleted",
          description: "Project is deleted",
          status: "success",
          duration: 10000,
          isClosable: true,
        });

        return true;
      } else {
        toast({
          title: "More admin signs needed",
          description: "This function needs 2 admin signs",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
      }
    }
    return false;
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
