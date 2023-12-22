import dummyimg from "../../images/dummyimg.png";
import { useNavigate } from "react-router-dom";
import { getFileFromIpfs } from "../../helpers";
import { useEffect } from "react";
import { useState } from "react";

const AuctionCard = (props) => {
    const navigate = useNavigate();
    const [imageURL, setImageURL] = useState("");

    useEffect(() => {
        const imageSetup = async () => {
            const resultImage = await getFileFromIpfs(props.fileHash, "image");
            setImageURL(URL.createObjectURL(resultImage.data));
        };
        imageSetup();
    }, [props]);

    console.log(props.fileHash);

    console.log("props.project:", props.project);

    return (
        <div
            className="p-card"
            style={{ cursor: "pointer" }}
            onClick={() =>
                navigate("/auction/" + props.projectID, {
                    state: props.project,
                })
            }>
            <div className="item-card">
                <div>
                    <img
                        src={imageURL == "" ? dummyimg : imageURL}
                        alt=""
                        style={{
                            aspectRatio: "16/9",
                            width: "100%",
                            height: "25vh",
                            objectFit: "fill",
                        }}
                    />
                </div>
                <div className="card-text">
                    <h3 className="card-title">{props.projectName}</h3>
                    <p className="card-desc">{props.projectDescription}</p>
                </div>
            </div>
        </div>
    );
};

export default AuctionCard;
