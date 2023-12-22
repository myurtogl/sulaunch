import React, { useState, useEffect } from "react";
import { SimpleGrid } from "@chakra-ui/react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
// Components

import ProjectCard from "./ProjectCard/ProjectCard";

import axios from "axios";
import Cookies from "js-cookie";

import LoadingIcon from "./LoadingIcon";

import { backendUrl } from "../config";

import { Buffer } from "buffer";

import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

const radios = [
  { name: "All", value: "0" },
  { name: "Approved", value: "1" },
  { name: "Pending", value: "2" },
  { name: "Rejected", value: "3" },
];

const Projects = (props) => {
  console.log(props);
  return (
    <section className="book">
      <h1> title </h1>
    </section>
  );
};

var pj = [];

const ProjectList = () => {
  const [error, setError] = useState(false);
  const [alignment, setAlignment] = useState(radios[0]);
  const [projects, setProjects] = useState(pj);
  const [listedProjects, setListedProjects] = useState();
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);

  const handleChange = async (newAlignment) => {
    if (newAlignment != null) {
      await setAlignment(newAlignment);
    }
  };

  const isTokenExpired = (token) =>
    Date.now() >=
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).exp *
      1000;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/Project/Get/All/false`,
        config
      );
      console.log("response");
      console.log(response.data.data);
      setProjects(response.data.data);
    } catch (error) {
      console.log(error);
      console.log("ERR END");
    }
    console.log("done");
  };

  useEffect(() => {
    const setupAllProjects = async () => {
      try {
        const apiInstance = axios.create({
          baseURL: backendUrl,
        });
        apiInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${Cookies.get("token")}`;
        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/Project/Get/All")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to add the project";
              reject(err);
            });
        });
        let result = await response2;
        console.log("ehee", result);
        setProjects(result.data.data);
        setListedProjects(result.data.data);
        setIsLoading(false);
        await setAlignment(0);

        const token = Cookies.get("token");
        if (token) {
          const tokenRole = JSON.parse(
            Buffer.from(token.split(".")[1], "base64")?.toString()
          )?.role.toLowerCase();

          console.log("Role:", tokenRole);

          if (token) {
            setRole(tokenRole);
          } else {
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.log(error);
      }
    };
    setupAllProjects();
  }, []);

  useEffect(() => {
    const alignmentSetup = async () => {
      try {
        alignment != 0
          ? setListedProjects(
              projects.filter(
                (project) => project.status == radios[alignment].name
              )
            )
          : setListedProjects(projects);
      } catch {}
    };
    alignmentSetup();
  }, [alignment]);

  return isLoading ? (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className="projects-page">
          <LoadingIcon />
        </div>
      </NotificationsProvider>
    </MantineProvider>
  ) : (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider position="bottom-center">
        <div className="projects-page">
          {role != null && role != "base" && role != "blacklist" ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ButtonGroup>
                <Button
                  style={{ fontFamily: "Montserrat" }}
                  className={
                    alignment === 0
                      ? "filter-button-active"
                      : "filter-button-deactive"
                  }
                  onClick={() => {
                    handleChange(0);
                  }}
                  value={radios[0].value}>
                  {radios[0].name}{" "}
                </Button>
                <Button
                  style={{ fontFamily: "Montserrat" }}
                  className={
                    alignment === 1
                      ? "filter-button-active"
                      : "filter-button-deactive"
                  }
                  onClick={() => {
                    handleChange(1);
                  }}
                  value={radios[1].value}>
                  {radios[1].name}{" "}
                </Button>
                <Button
                  style={{ fontFamily: "Montserrat" }}
                  className={
                    alignment === 2
                      ? "filter-button-active"
                      : "filter-button-deactive"
                  }
                  onClick={() => {
                    handleChange(2);
                  }}
                  value={radios[2].value}>
                  {radios[2].name}{" "}
                </Button>
                <Button
                  style={{ fontFamily: "Montserrat" }}
                  className={
                    alignment === 3
                      ? "filter-button-active"
                      : "filter-button-deactive"
                  }
                  onClick={() => {
                    handleChange(3);
                  }}
                  value={radios[3].value}>
                  {radios[3].name}{" "}
                </Button>
              </ButtonGroup>
            </div>
          ) : null}

          <br></br>

          <div style={{ width: "90%", textAlign: "center", margin: "auto" }}>
            {listedProjects.length > 0 ? (
              <SimpleGrid minChildWidth="40vw" spacing="40px">
                {listedProjects.map((project, index) => (
                  <ProjectCard
                    imageUrl={project.imageUrl}
                    projectName={project.projectName}
                    projectDescription={project.projectDescription}
                    projectStatus={project.status}
                    projectRating={project.rating}
                    fileHash={project.fileHash}
                    projectID={project.projectID}
                    userRole={role}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <div>
                <div
                  className="sectionName"
                  style={{ display: "flex", justifyContent: "center" }}>
                  No Projects Found
                </div>
              </div>
            )}
          </div>
          <br></br>
        </div>
      </NotificationsProvider>
    </MantineProvider>
  );
};

export default ProjectList;
