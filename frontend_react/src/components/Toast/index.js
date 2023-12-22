import React from "react";
// Components
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// Styles

import Toast from "react-bootstrap/Toast";
import { ToastContainer } from "react-bootstrap";

function ToastBar({ toastShow, toastText, toastHeader, setToastshow }) {
    return (
        <Row>
            <Col xs={6}>
                <ToastContainer
                    position={"top-start"}
                    style={{ paddingTop: "100px" }}>
                    <Toast
                        onClose={() => setToastshow(false)}
                        show={toastShow}
                        delay={10000}
                        autohide>
                        <Toast.Header>{toastHeader}</Toast.Header>
                        <Toast.Body>{toastText}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Col>
        </Row>
    );
}

export default ToastBar;
