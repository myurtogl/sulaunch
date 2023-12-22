import { useEffect, useState } from "react";
import {
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    useToast,
} from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons";
import { dotnetAPI } from "../../request/AxiosInterceptor";
import { deleteProject } from "../../interactions/project";

export default function ProjectBox() {
    const [projects, setProjects] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [select, setSelect] = useState();
    const toast = useToast();

    const handleSearchChange = (e) => {
        var projL = [];
        const val = e.target.value.toLocaleLowerCase();
        if (val == "" || val == null) {
            setProjectsList(projects);
            return;
        }
        projects.map((u) => {
            var name = u.projectName;
            if (name.toLocaleLowerCase().includes(val)) {
                projL.push(u);
            }
        });
        setProjectsList(projL);
    };
    const handleSelect = (e, proj) => {
        setSelect(proj);
    };

    useEffect(() => {
        dotnetAPI.get(`/Project/Get/All`).then((res) => {
            const proj = res.data.data;

            const sortedProjects = proj.sort((a, b) =>
                a.projectName.localeCompare(b.name)
            );
            setProjects(sortedProjects);
            setProjectsList(sortedProjects);
            //selected(sortedProjects.at(0))
            setSelect(sortedProjects.at(0));
            //auctioned(sortedProjects.filter((proj) => proj?.isAuctionCreated === true))
        });
    }, []);

    useEffect(() => {
        setProjectsList(projects);
    }, [projects]);

    return (
        <div className="admin-box">
            <div className="admin-select-box">
                <InputGroup>
                    <InputLeftElement
                        pointerEvents="none"
                        color="white"
                        fontSize="1.2em"
                        children={<IconSearch />}
                    />
                    <Input
                        color="white"
                        placeholder="Search Project"
                        onChange={handleSearchChange}
                    />
                </InputGroup>
                <div className="admin-scroll-box">
                    {projectsList.map((proj) => (
                        <button
                            key={proj.projectID}
                            onClick={(e) => handleSelect(e, proj)}>
                            {proj.projectName}
                        </button>
                    ))}
                </div>
                {/*<Select onChange={handleChange}>
                    {projects.map((proj) => ( 
                        <option key={proj.projectID} value={proj.fileHash}>
                            {proj.projectName}
                        </option>
                    ))}
                </Select>*/}
            </div>
            {select && (
                <div className="admin-info-box">
                    <p className="info-name">{select.projectName}</p>
                    <div className="info-field">
                        <p className="info-field-name">Description:</p>
                        <p className="info-value">
                            {select.projectDescription}
                        </p>
                    </div>
                    <div className="info-field">
                        <p className="info-field-name">Auction Status:</p>
                        <p className="info-value">
                            {select.isAuctionCreated
                                ? "Created"
                                : "Not Created"}
                        </p>
                    </div>
                    <div className="info-field">
                        <p className="info-field-name">Proposer:</p>
                        <p className="info-value">{select.proposerAddress}</p>
                    </div>
                    <div className="user-controls">
                        <div className="user-controls-col">
                            <Button
                                onClick={() =>
                                    deleteProject(toast, select).then(
                                        (success) => {
                                            if (success) {
                                                const filteredProjects =
                                                    projects.filter(
                                                        (proj) =>
                                                            proj.projectID !==
                                                            select.projectID
                                                    );
                                                setProjects(filteredProjects);
                                                setSelect(
                                                    filteredProjects.at(0)
                                                );
                                            }
                                        }
                                    )
                                }
                                disabled={select.isAuctionCreated}
                                colorScheme="red"
                                variant="outline"
                                size="lg">
                                Delete Project
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
