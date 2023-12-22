import {
    Text,
    useDisclosure,
    FormControl,
    FormLabel,
    Textarea,
} from "@chakra-ui/react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
} from "@chakra-ui/react";

import { useState } from "react";
import NoImage from "../../images/no_image.jpg";
import { getFileFromIpfs } from "../../helpers.js";
import { useEffect } from "react";
import { Rating } from "@mantine/core";
//id,imageUrl,desc,title,status,approvals

function ProjectsCard(props) {
    const [username, setUserName] = useState("");
    const [role, setRole] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectImg, setProjectImg] = useState("");
    const [imageURL, setImageURL] = useState("");

    useEffect(() => {
        const imageUrlSetup = async () => {
            const imageResult = await getFileFromIpfs(props.fileHash, "image");
            setImageURL(URL.createObjectURL(imageResult.data));
        };
        imageUrlSetup();
    }, []);
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure(); //used for modals on button clicks
    const {
        isOpen: isInvitationOpen,
        onOpen: onInvitationOpen,
        onClose: onInvitationClose,
    } = useDisclosure();

    const deleteHandler = async () => {
        const deletedProject = props;
        onDeleteClose();
        props.deleteFunction(deletedProject);
    };

    const invitationHandler = async (event) => {
        event.preventDefault();

        var invitationRequest = {
            projectID: props.projectID,
            username: username,
            role: role,
        };
        onInvitationClose();
        props.invitationFunction(invitationRequest);
    };

    const editHandler = async (event) => {
        event.preventDefault();

        var editRequest = {
            projectID: props.projectID,
            projectName: projectName,
            projectDescription: projectDescription,
            imageUrl: projectImg,
            rating: props.rating,
            status: props.status,
        };

        props.editFunction(editRequest);
    };
    const handleInput = (e) => {
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;

        if (name == "username") setUserName(value);
        else if (name == "role") setRole(value);
        else if (name == "projectName") setProjectName(value);
        else if (name == "projectDescription") setProjectDescription(value);
    };

    const downloadFile = async (file, projectId) => {
        const reader = new FileReader();

        reader.readAsText(file);
        reader.onloadend = async () => {
            const data = window.URL.createObjectURL(file);
            const tempLink = await document.createElement("a");
            tempLink.href = data;
            tempLink.download = "Project_#" + projectId + ".pdf"; // some props receive from the component.
            tempLink.click();
        };
    };

    const onDownloadPDF = async () => {
        try {
            console.log(props);
            getFileFromIpfs(props.fileHash, "whitepaper").then((res) =>
                downloadFile(res.data, props.projectID)
            );
        } catch (error) {
            console.log(error);
        }
    };

    const getRibbonColor = (status) => {
        var color = "";
        switch (status) {
            case "Approved":
                color = "#2ac52a";
                break;
            case "Pending":
                color = "#dfd116";
                break;
            case "Rejected":
                color = "#df1616";
                break;
            default:
                color = "#dfd116";
        }
        const style = {
            backgroundColor: color,
        };
        return style;
    };

    return (
        <>
            <div>
                <div className="ribbon ribbon-top-left">
                    <span style={getRibbonColor(props.status)}>
                        {props.status}
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="item-card-profilepage">
                        <div style={{ height: "45vh" }}>
                            <img
                                src={imageURL ?? NoImage}
                                alt=""
                                style={{
                                    width: "100%",
                                    height: "45vh",
                                    objectFit: "fill",
                                }}
                            />
                        </div>
                        <div>
                            <div className="card-total-projectpage">
                                <div className="card-top-profilepage">
                                    <div className="card-title-projectpage-with-rating">
                                        <div className="card-title-projectpage">
                                            {props.projectName}
                                        </div>
                                        <Rating
                                            value={props.rating}
                                            fractions={5}
                                            readOnly
                                        />
                                    </div>
                                    <div className="card-desc-projectpage">
                                        {props.projectDescription}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-bottom-profilepage">
                        <a
                            style={{ borderBottomLeftRadius: "10px" }}
                            className="whitelist-button-profilepage"
                            onClick={onDownloadPDF}>
                            Download PDF
                        </a>
                        <a
                            className="whitelist-button-profilepage"
                            onClick={onEditOpen}>
                            Edit
                            <Modal
                                isCentered
                                onClose={onEditClose}
                                isOpen={isEditOpen}
                                motionPreset="slideInBottom">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader
                                        style={{ fontFamily: "Montserrat" }}>
                                        Edit Your Project Name & Description
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <form onSubmit={editHandler}>
                                        <ModalBody>
                                            <FormControl isRequired>
                                                <FormLabel
                                                    style={{
                                                        fontFamily:
                                                            "Montserrat",
                                                    }}>
                                                    Please enter the project
                                                    name:
                                                </FormLabel>
                                                <Input
                                                    name="projectName"
                                                    onChange={handleInput}
                                                    placeholder="Project Name"
                                                    style={{
                                                        fontFamily:
                                                            "Montserrat",
                                                    }}
                                                />
                                                <br />
                                                <br />
                                                <FormLabel
                                                    style={{
                                                        fontFamily:
                                                            "Montserrat",
                                                    }}>
                                                    Please enter the project
                                                    description:
                                                </FormLabel>
                                                <Textarea
                                                    name="projectDescription"
                                                    onChange={handleInput}
                                                    placeholder="Project Description"
                                                    style={{
                                                        fontFamily:
                                                            "Montserrat",
                                                    }}
                                                />
                                            </FormControl>
                                        </ModalBody>
                                        <ModalFooter>
                                            <button
                                                type="submit"
                                                className="apply-button">
                                                Edit
                                            </button>
                                        </ModalFooter>
                                    </form>
                                </ModalContent>
                            </Modal>
                        </a>
                        <a
                            className="whitelist-button-profilepage"
                            onClick={onInvitationOpen}>
                            Add Collaborator
                            <Modal
                                isCentered
                                onClose={onInvitationClose}
                                isOpen={isInvitationOpen}
                                motionPreset="slideInBottom">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader fontFamily={"Montserrat"}>
                                        Send invitation to your team member to
                                        collaborate!
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <form onSubmit={invitationHandler}>
                                        <ModalBody>
                                            <FormControl isRequired>
                                                <FormLabel
                                                    fontFamily={"Montserrat"}>
                                                    Please enter the username of
                                                    the user:
                                                </FormLabel>
                                                <Input
                                                    name="username"
                                                    onChange={handleInput}
                                                    placeholder="Username"
                                                    fontFamily={"Montserrat"}
                                                />

                                                <br />
                                                <br />
                                                <FormLabel
                                                    fontFamily={"Montserrat"}>
                                                    Please enter the role of the
                                                    user. Your team member can
                                                    be either Editor or
                                                    Co-Owner:{" "}
                                                </FormLabel>
                                                <Input
                                                    name="role"
                                                    onChange={handleInput}
                                                    placeholder="Role"
                                                    fontFamily={"Montserrat"}
                                                />
                                            </FormControl>
                                        </ModalBody>
                                        <ModalFooter>
                                            <button
                                                type="submit"
                                                className="apply-button">
                                                Send Invitation
                                            </button>
                                        </ModalFooter>
                                    </form>
                                </ModalContent>
                            </Modal>
                        </a>
                        <a
                            style={{ borderBottomRightRadius: "10px" }}
                            className="whitelist-button-profilepage"
                            onClick={onDeleteOpen}>
                            Delete
                            <Modal
                                isCentered
                                onClose={onDeleteClose}
                                isOpen={isDeleteOpen}
                                motionPreset="slideInBottom">
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader
                                        style={{ fontFamily: "Montserrat" }}>
                                        Are you sure you want to delete this
                                        project?
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <Text
                                            count={2}
                                            style={{
                                                fontFamily: "Montserrat",
                                            }}>
                                            You cannot undo this process.
                                        </Text>
                                    </ModalBody>
                                    <ModalFooter>
                                        <button
                                            onClick={deleteHandler}
                                            className="apply-button">
                                            Delete Project
                                        </button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProjectsCard;
