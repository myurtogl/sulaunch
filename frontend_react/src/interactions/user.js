import { ethers } from "ethers";
import ethersAbi from "../contracts_hardhat/artifacts/contracts/ProjectRegister.sol/ProjectRegister.json";
import { ProjectRegisterAddress } from "../config";
import { dotnetAPI } from "../request/AxiosInterceptor";

export async function changeUserStatus(toast, selected, status) {
  toast({
    title: "Changing user status",
    description: "Please wait...",
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

    var registerContract = await new ethers.Contract(
      ProjectRegisterAddress,
      ethersAbi.abi,
      signer
    );

    var registerTx = await registerContract.editUserStatus(
      selected.address,
      status.value
    );
    console.log("RESULT: ", registerTx);

    toast({
      title: "Pending transaction",
      description: "Transaction is pending...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    let receipt = await registerTx.wait();

    await dotnetAPI.patch(
      `/User/UpdateRole/${selected.address}/${status.label}`
    );

    toast({
      title: "User Status",
      description: "User status changed successfully",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    console.log("RESULT: ", receipt);
    if (typeof receipt !== "undefined") {
      return true;
    }
    return false;
  } catch (error) {
    toast({
      title: "Error",
      description: "Error while changing user status",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}

export async function promoteUserToAdmin(toast, selected) {
  toast({
    title: "Trying to promote user to admin",
    description: "Please wait...",
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

    const adminRole = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("ADMIN_ROLE")
    );

    const registerTx = await registerContract.grantRole(
      adminRole,
      selected.address
    );

    toast({
      title: "Pending transaction",
      description: "Transaction is pending...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    let receipt = await registerTx.wait();

    await dotnetAPI.patch(`/User/UpdateRole/${selected.address}/"Admin"`);

    toast({
      title: "Admin",
      description: "User is Admin now",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    console.log("RESULT: ", receipt);
    if (typeof receipt !== "undefined") {
      return true;
    }
    return false;
  } catch (error) {
    toast({
      title: "Error",
      description: "Error while Granting Admin permission might not be enough",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}

export async function RenounceUserfromAdmin(toast, selected) {
  toast({
    title: "Trying to renounce user from the admin role",
    description: "Please wait...",
    status: "info",
    duration: 1000,
    isClosable: true,
  });

  try {
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const statusMapping = ["Base", "Whitelist", "Blacklist", "Viewer"];
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

    const adminRole = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("ADMIN_ROLE")
    );

    let registerTx;
    const signerAddress = await signer.getAddress();

    if (selected.address === signerAddress) {
      registerTx = await registerContract.renounceRole(
        adminRole,
        selected.address
      );
    } else {
      registerTx = await registerContract.revokeRole(
        adminRole,
        selected.address
      );
    }

    toast({
      title: "Pending transaction",
      description: "Transaction is pending...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    let receipt = await registerTx.wait();
    const userStatus = await registerContract.statusList(selected.address);

    await dotnetAPI.patch(
      `/User/UpdateRole/${selected.address}/${statusMapping[userStatus]}`
    );
    toast({
      title: "Admin",
      description: "User is not an Admin anymore",
      status: "info",
      duration: 1000,
      isClosable: true,
    });

    console.log("RESULT: ", receipt);
    if (typeof receipt !== "undefined") {
      return true;
    }
    return false;
  } catch (error) {
    toast({
      title: "Error",
      description:
        "Error while Renouncing Admin. Need to have Default Admin permission",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}

export async function deleteUser(toast, selected) {
  console.log(selected, "selected");

  toast({
    title: "Deleting user",
    description: "Please wait...",
    status: "info",
    duration: 1000,
    isClosable: true,
  });

  try {
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract

    if (
      selected.role === "Blacklist" ||
      (await changeUserStatus(toast, selected, { value: 2 }))
    ) {
      await dotnetAPI.delete(`/User/DeleteUser/${selected.id}`);

      toast({
        title: "User Deleted",
        description: "User deleted successfully",
        status: "info",
        duration: 1000,
        isClosable: true,
      });
      return true;
    } else {
      toast({
        title: "Problem in blockchain",
        description: "blockchain role blacklisting failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error while deleting user",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
}
