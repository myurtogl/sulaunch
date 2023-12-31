import { FormLabel, FormControl } from "@chakra-ui/react";
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
import { useDisclosure } from "@chakra-ui/react";

const ProfilePageCard = (props) => {
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");

    const editHandler = async (event) => {
        event.preventDefault();

        var editRequest = {
            username: props.username,
            name: name,
            surname: surname,
            email: email,
            address: props.address,
        };

        console.log(editRequest);

        onEditClose();

        props.userEditFunction(editRequest);
    };

    const handleInput = (e) => {
        const input_name = e.currentTarget.name;
        const value = e.currentTarget.value;

        if (input_name == "name") setName(value);
        else if (input_name == "surname") setSurname(value);
        else if (input_name == "email") setEmail(value);
    };

    return (
        <div className="profile-fixed">
            <div className="profile-fixed-card">
                <div>
                    <h1>Welcome {props.name}</h1>
                </div>
                <div>
                    <h5>
                        Username: <p>{props.username}</p>
                    </h5>
                </div>
                <div>
                    <h5>
                        Name: <p>{props.name}</p>{" "}
                    </h5>
                </div>
                <div>
                    <h5>
                        Surname: <p>{props.surname}</p>{" "}
                    </h5>
                </div>
                <div>
                    <h5>
                        Email: <p>{props.email}</p>
                    </h5>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <a
                    className="whitelist-button-profilepage"
                    style={{
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                    }}
                    onClick={onEditOpen}>
                    Edit User Information
                </a>
                <Modal
                    isCentered
                    onClose={onEditClose}
                    isOpen={isEditOpen}
                    motionPreset="slideInBottom">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader style={{ fontFamily: "Montserrat" }}>
                            Edit Your User Information
                        </ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={editHandler}>
                            <ModalBody>
                                <FormControl isRequired>
                                    <FormLabel
                                        style={{ fontFamily: "Montserrat" }}>
                                        Please enter your name:
                                    </FormLabel>
                                    <Input
                                        name="name"
                                        onChange={handleInput}
                                        placeholder="Name"
                                        style={{ fontFamily: "Montserrat" }}
                                    />
                                    <FormLabel
                                        style={{ fontFamily: "Montserrat" }}>
                                        Please enter your surname:
                                    </FormLabel>
                                    <Input
                                        name="surname"
                                        onChange={handleInput}
                                        placeholder="Surname"
                                        style={{ fontFamily: "Montserrat" }}
                                    />
                                    <FormLabel
                                        style={{ fontFamily: "Montserrat" }}>
                                        Please enter your email:
                                    </FormLabel>
                                    <Input
                                        name="email"
                                        onChange={handleInput}
                                        placeholder="Email"
                                        style={{ fontFamily: "Montserrat" }}
                                    />
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                {/*<Button
                onClick={onEditClose}
                variant="ghost"
                background-color="#F8F8FF"
                color="#2f2d2e"
                border="2px solid #8e00b9"
                border-radius="30px"
                text-align="center"
                transition-duration="0.5s"
                animation="ease-in-out"
                _hover={{
                  background:
                    "linear-gradient(to left, #2d00f7, #ff0291)",
                  transform: "scale(1.2)",
                  border: "none",
                  textColor: "white",
                }}
              >
                Close
              </Button>*/}
                                <button type="submit" className="apply-button">
                                    Edit
                                </button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default ProfilePageCard;
