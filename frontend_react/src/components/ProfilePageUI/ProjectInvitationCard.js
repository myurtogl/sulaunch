import { useState } from "react";
import NoImage from "../../images/no_image.jpg";

import { getFileFromIpfs } from "../../helpers.js";
import { useEffect } from "react";
import { Rating } from "@mantine/core";

function ProjectInvitationCard(props) {
    const [imageURL, setImageURL] = useState("");

    useEffect(() => {
        const imageUrlSetup = async () => {
            console.log("props.fileHash:", props.fileHash);

            const imageResult = await getFileFromIpfs(props.fileHash, "image");
            setImageURL(URL.createObjectURL(imageResult.data));
        };
        imageUrlSetup();
    }, []);

    const colorMap = {
        Approved: "green",
        Rejected: "red",
        Pending: "orange",
    };

    const invitationAcceptHandler = async () => {
        const acceptedProject = props;

        props.invitationAccept(acceptedProject);
    };

    const invitationRejectHandler = async () => {
        const rejectedProject = props;

        props.invitationReject(rejectedProject);
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
                            onClick={invitationAcceptHandler}>
                            Accept Invitation
                        </a>

                        <a
                            style={{ borderBottomRightRadius: "10px" }}
                            className="whitelist-button-profilepage"
                            onClick={invitationRejectHandler}>
                            Reject Invitation
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProjectInvitationCard;
