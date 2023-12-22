import dummyimg from "../../images/dummyimg.png";
import React from "react";
import { getFileFromIpfs } from "../../helpers.js";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import {
    NotificationsProvider,
    showNotification,
    cleanNotifications,
} from "@mantine/notifications";
import { IconX } from "@tabler/icons";

const ProjectCard = (props) => {
    const [image, setImage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const imageSetup = async () => {
            setImage(await getFileFromIpfs(props.fileHash, "image"));
        };
        imageSetup();
    }, []);
    console.log(image.data);

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
        <MantineProvider withNormalizeCSS withGlobalStyles>
            <NotificationsProvider position="bottom-center">
                <div
                    className="p-card"
                    onClick={() => {
                        if (props.userRole != null) {
                            navigate("/projects/" + props.projectID);
                        } else {
                            cleanNotifications();

                            showNotification({
                                title: "User Not Logged In!",
                                message:
                                    "Please log-in to SuLaunch to see the project details.",
                                icon: <IconX size={16} />,
                                color: "red",
                                autoClose: true,
                            });
                        }
                    }}
                    style={{ cursor: "pointer" }}>
                    <div className="ribbon ribbon-top-left">
                        <span style={getRibbonColor(props.projectStatus)}>
                            {props.projectStatus}
                        </span>
                    </div>
                    <div className="item-card">
                        <div>
                            <img
                                src={
                                    image == ""
                                        ? dummyimg
                                        : URL.createObjectURL(image.data)
                                }
                                alt=""
                                style={{
                                    width: "100%",
                                    height: "25vh",
                                    objectFit: "fill",
                                }}
                            />
                        </div>
                        <div className="card-text">
                            <h3 className="card-title">{props.projectName}</h3>
                            <p className="card-desc">
                                {props.projectDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </NotificationsProvider>
        </MantineProvider>
    );
};

export default ProjectCard;
