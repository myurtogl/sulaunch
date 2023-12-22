import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

function simulateNetworkRequest() {
    return new Promise((resolve) => setTimeout(resolve, 2000));
}

const LoadingButton = (props) => {
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (props.show) {
            simulateNetworkRequest().then(() => {
                setLoading(false);
            });
        }
    }, [props.show]);

    return (
        <>
            {props.show ? (
                <Button
                    variant="dark"
                    disabled
                    style={{ fontFamily: "Montserrat" }}>
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    <span className="visually-hidden">Loading...</span>
                </Button>
            ) : (
                <Button
                    style={{ fontFamily: "Montserrat" }}
                    variant="dark"
                    disabled={props.show}
                    onClick={!props.show ? props.func : null}>
                    {" "}
                    {props.text}
                </Button>
            )}
        </>
    );
};

export default LoadingButton;
