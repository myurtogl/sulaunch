import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ProfilePageCard from "./ProfilePageUI/ProfilePageCard";
import ProjectsCard from "./ProfilePageUI/ProjectsCard";
import ProjectInvitationCard from "./ProfilePageUI/ProjectInvitationCard";
import { useNavigate } from 'react-router-dom';

import LoadingIcon from './LoadingIcon';

import { backendUrl } from '../config';

import { showNotification, cleanNotifications } from '@mantine/notifications';
import { IconX, IconCheck } from '@tabler/icons';


var user = [];

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

const apiInstance = axios.create({
  baseURL: backendUrl,
});


const ProfilePage = () => {
  const navigate = useNavigate();
  const [User, setUser] = useState(user);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const profileSetup = async () => {
      try {
        const apiInstance = axios.create({
          baseURL: backendUrl,
        });
        apiInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${Cookies.get("token")}`;
        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/User/Get")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to get the user";
              reject(err);
            });
        });
        let result = await response2;
        console.log("User get request is successful", result);
        setUser(result.data.data);
      } catch (error) {
        console.log(error);
        navigate("/notAuthorized");


      }
    }
    profileSetup();

  }, []);

  const [projects, setProjects] = useState([]);
  const [invitedProjects, setInvitedProjects] = useState([]);

  useEffect(() => {
    const profileSetup = async () => {
      try {
        apiInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${Cookies.get("token")}`;

        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/Project/GetAllPermissioned/false")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to get the projects of the user";
              reject(err);
            });
        });
        let result = await response2;
        console.log("Projects get request is successful", result);
        setProjects(result.data.data);
      } catch (error) {
        console.log(error);
      }
    }
    profileSetup();
  }, []);

  useEffect(() => {
    const profileSetup = async () => {
      try {
        apiInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${Cookies.get("token")}`;

        let response2 = new Promise((resolve, reject) => {
          apiInstance
            .get("/Project/GetAllInvitations")
            .then((res) => {
              console.log("response: ", res.data);
              resolve(res);
            })
            .catch((e) => {
              const err = "Unable to get invitations of the user";
              reject(err);
            });
        });
        let result = await response2;
        console.log("Invitation get request is successful", result);
        setInvitedProjects(result.data.data);

        console.log("Invited projects:", result.data.data)

        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    profileSetup();
  }, []);


  const onDelete = async (deletedProject) => {
    try {
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .delete("/Project/Delete/" + deletedProject.projectID)
          .then((res) => {
            console.log("Project deleted!")
            console.log("response: ", res.data);
            const newProjectList = projects.filter((project) => project.projectID !== deletedProject.projectID);
            setProjects(newProjectList);
            resolve(res);

            showNotification({
              title: 'Delete for Project has done!',
              message: `You have succesfully deleted the project.`,
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: true,
              //onClose: () => window.location.reload()
            })
          })
          .catch((e) => {
            const err = "Unable to delete the project";
            reject(err);

            cleanNotifications();

            showNotification({
              title: 'Unable to delete the project!',
              message: e.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: true,
              //nClose: () => window.location.reload()
            })
          });
      });
      let result = await response2;
    } catch (error) {
      console.log(error);
    }
  };

  const onInvitation = async (invitationRequest) => {
    try {
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .post("/User/Invite/", invitationRequest)
          .then((res) => {
            console.log("Invitation request sent")
            console.log("response: ", res.data)

            cleanNotifications();

            showNotification({
              title: 'Your collaboration request has sent successfully!',
              message: `The collaborator will see an invitation on profile page.`,
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: true,
              //onClose: () => window.location.reload()
            })
          })
          .catch((e) => {
            const err = "Unable to send invitation request";
            reject(err);

            cleanNotifications();

            showNotification({
              title: 'Unable to send invitation request!',
              message: e.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: true,
              //nClose: () => window.location.reload()
            })
          });
      });
      let result = await response2;
    } catch (error) {
      console.log(error);
    }
  };

  const onInvitationAccept = async (acceptedProject) => {
    const acceptRequest = {
      projectID: acceptedProject.projectID,
      Username: User.username,
      Role: "Editor",
      IsAccepted: true
    };

    try {
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .put("/User/InvitationReply", acceptRequest)
          .then((res) => {
            console.log("Project is Accepted!")
            console.log("response: ", res.data);
            const newProjectList = projects.concat(acceptedProject);
            const newInvitationList = invitedProjects.filter((project) => project.projectID !== acceptedProject.projectID);
            setProjects(newProjectList);
            setInvitedProjects(newInvitationList);
            resolve(res);

            cleanNotifications();

            showNotification({
              title: 'Invitation is succesfully accepted!',
              message: `You can access the collaborated project.`,
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: true,
              //onClose: () => window.location.reload()
            })

          })
          .catch((e) => {
            const err = "Unable to accept the project";
            reject(err);

            cleanNotifications();

            showNotification({
              title: 'Unable to Accept the Invitation!',
              message: e.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: true,
            })
          });
      });
      let result = await response2;
    } catch (error) {
      console.log(error);
    }
  };

  const onInvitationReject = async (rejectedProject) => {
    const rejectRequest = {
      projectID: rejectedProject.projectID,
      Username: User.username,
      Role: "Editor",
      IsAccepted: false
    };

    try {
      apiInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${Cookies.get("token")}`;
      let response2 = new Promise((resolve, reject) => {
        apiInstance
          .put("/User/InvitationReply", rejectRequest)
          .then((res) => {
            console.log("Project is Rejected!")
            console.log("response: ", res.data);
            const newInvitationList = invitedProjects.filter((project) => project.projectID !== rejectedProject.projectID);
            setInvitedProjects(newInvitationList);
            resolve(res);

            cleanNotifications();

            showNotification({
              title: 'Invitation is succesfully rejected!',
              message: `You have chosen not to be a collaborator of this project.`,
              icon: <IconCheck size={16} />,
              color: "teal",
              autoClose: true,
              //onClose: () => window.location.reload()
            })
          })
          .catch((e) => {
            const err = "Unable to reject the project";
            reject(err);

            cleanNotifications();

            showNotification({
              title: 'Unable to Reject the Invitation!',
              message: e.message,
              icon: <IconX size={16} />,
              color: "red",
              autoClose: true,
            })
          });
      });
      let result = await response2;
    } catch (error) {
      console.log(error);
    }
  };

  const onEdit = async (editRequest) => {
    editRequest.imageUrl = ""
    const apiInstance = axios.create({
      baseURL: backendUrl,
    })


    console.log(editRequest)
    apiInstance.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get('token')}`
    let response2 = new Promise((resolve, reject) => {
      console.log(editRequest)
      apiInstance.put("/Project/Update/",
        {
          ProjectID: editRequest.projectID,
          ProjectName: editRequest.projectName,
          ProjectDescription: editRequest.projectDescription,

        })

        .then((res) => {
          console.log("Edit is done")
          console.log(res.data)
          resolve(res)

          cleanNotifications();

          showNotification({
            title: 'Edit for Project is Done!',
            message: `You have succesfully edited the project.`,
            icon: <IconCheck size={16} />,
            color: "teal",
            autoClose: true,
            onClose: () => window.location.reload()
          })
        })
        .catch((e) => {
          const err = "Unable to edite the project"
          reject(err)
          console.log(e)

          cleanNotifications();

          showNotification({
            title: 'Unable to Edit the Project!',
            message: e.message,
            icon: <IconX size={16} />,
            color: "red",
            autoClose: true,
            onClose: () => window.location.reload()
          })
        })
    })
  };

  const onUserInfoEdit = async (editRequest) => {
    editRequest.imageUrl = ""
    const apiInstance = axios.create({
      baseURL: backendUrl,
    })


    console.log(editRequest)
    apiInstance.defaults.headers.common["Authorization"] = `Bearer ${Cookies.get('token')}`
    let response2 = new Promise((resolve, reject) => {
      console.log(editRequest)
      apiInstance.put("/User/Update/",
        {
          Username: editRequest.username,
          Name: editRequest.name,
          surname: editRequest.surname,
          MailAddress: editRequest.email,
          //Address: editRequest.address,
        })

        .then((res) => {
          console.log("User info edit is done")
          console.log(res.data)
          resolve(res)

          cleanNotifications();

          setUser(res.data.data)

          showNotification({
            title: 'Edit for User Information is Done!',
            message: `You have succesfully changed your information.`,
            icon: <IconCheck size={16} />,
            color: "teal",
            autoClose: true,
            sx: { zIndex: 15000 }
            //onClose: () => window.location.reload()
          })
        })
        .catch((e) => {
          const err = "Unable to edit the user info"
          reject(err)
          console.log(e)

          cleanNotifications();

          showNotification({
            title: 'Unable to edit the user information!',
            message: e.message,
            icon: <IconX size={16} />,
            color: "red",
            autoClose: true,
            //onClose: () => window.location.reload()
          })
        })

    })
  };

  return (
    isLoading ?

      <div className={'profile-page'}>
        <LoadingIcon />
      </div>
      :
      <>
        <div className="profile-page">
          <div className="profile-card">
            <ProfilePageCard
              name={User.name}
              surname={User.surname}
              email={User.mailAddress}
              username={User.username}
              userEditFunction={onUserInfoEdit}
            />
          </div>



          <div className="profile-project-items">

            {console.log("Project check:", projects)}
            {invitedProjects.map((invitation) => (
              <>
                <ProjectInvitationCard
                  projectName={invitation.projectName}
                  status={invitation.status}
                  projectDescription={invitation.projectDescription}
                  imageUrl={invitation.imageUrl}
                  rating={invitation.rating}
                  projectID={invitation.projectID}
                  invitationAccept={onInvitationAccept}
                  invitationReject={onInvitationReject}
                  fileHash={invitation.fileHash}
                >
                </ProjectInvitationCard>
              </>
            ))}

            {console.log("Project check:", projects)}
            {projects.map((project) => (
              <>
                <ProjectsCard
                  projectName={project.projectName}
                  status={project.status}
                  projectDescription={project.projectDescription}
                  rating={project.rating}
                  projectID={project.projectID}
                  fileHash={project.fileHash}
                  deleteFunction={onDelete}
                  invitationFunction={onInvitation}
                  editFunction={onEdit}
                ></ProjectsCard>
                <br />
              </>
            ))}
          </div>
        </div>
      </>
  );
};

export default ProfilePage;
