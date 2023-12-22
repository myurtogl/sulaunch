import React from "react";
import { Text, Avatar, Card, Image, Group, Badge } from "@mantine/core";

function About() {
  const developers = [
    {
      name: "Arman Sayan",
      role: "Frontend Developer",
      email: "sayanarman@sabanciuniv.edu",
      image: "http://suisimg.sabanciuniv.edu/photos/000026859156802134.jpg",
    },
    {
      name: "Aksel Ventura",
      role: "Frontend Developer",
      email: "akselventura@sabanciuniv.edu",
      image: "http://suisimg.sabanciuniv.edu/photos/000028177234649711.jpg", // Add a default image or placeholder if no image is available
    },
    {
      name: "Ata Uğur Sarıyaka",
      role: "Full-Stack Developer",
      email: "atasarikaya@sabanciuniv.edu",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Baturay Birinci",
      role: "Frontend Developer",
      email: "baturaybirinci@sabanciuniv.edu",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Burak Emre Salter",
      role: "Backend Developer",
      email: "esalter@sabanciuniv.edu",
      image: "http://suisimg.sabanciuniv.edu/photos/000026385636436138.jpg",
    },
    {
      name: "Ercan Beyen",
      role: "Backend Developer",
      email: "ercanbeyen@hotmail.com",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Eren Akyıldız",
      role: "Frontend Developer",
      email: "eren.akyildiz@sabanciuniv.edu",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Erhan Ali Bölükbaş",
      role: "Blockchain Developer",
      email: "erhanb@sabanciuniv.edu",
      image: "http://suisimg.sabanciuniv.edu/photos/000026576207970458.jpg",
    },
    {
      name: "Gönül Zeynep Perek",
      role: "Frontend Developer",
      email: "gonulzeynep@sabanciuniv.edu",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Püren Tap",
      role: "Frontend Developer",
      email: "tap@alumni.sabanciuniv.edu",
      image: null, // Add a default image or placeholder if no image is available
    },
    {
      name: "Umut Şahin Önder",
      role: "Full-Stack Developer",
      email: "umutonder@sabanciuniv.edu",
      image: "http://suisimg.sabanciuniv.edu/photos/000028248538631489.jpg",
    },
  ];
  return (
    <div className="about-style">
      <div className="about-title">About SuLaunch</div>
      <br />
      <div className="about-paragraph">
        SuLaunch is an ENS491/492 project offered at the Sabanci University as a
        graduation project. The main aim of this project is to introduce
        Blockchain technology to CS enthusiasts and wants to explore new
        technology.
      </div>
      <br />
      <div className="about-paragraph">
        This project aims to create the foundation for the utilization of
        blockchain technology in Sabanci University through an utility token
        (SUCoin) deployed on one of the EVM compatible blockchains. The main
        priority is to provide a fundraising platform for students to propose
        their projects and distribute their project’s tokens for funds via the
        auction mechanism provided by our system. The process will be as basic
        as possible for users to use blockchain technology, most of the key
        features of our project will be automated through the smart contracts
        and the backend server.
      </div>
      <br />
      <div className="about-paragraph">
        One of the key points of this part of the project is to protect the
        ideas of the project proposers as in the real world, fundraising can be
        vulnerable to the theft of ideas. The project provides a hybrid solution
        where both traditional databases and a blockchain are utilized to
        provide a safety measure. This is achieved through saving the hash of
        the project details in the blockchain and commercialized versions of the
        project details in the database. This lets users be able to show the
        ownership of the document through their wallet and the logs in the
        blockchain by our web application during the applying process.
      </div>
      <br />
      <div className="about-paragraph">
        {" "}
        The motivation for the project lies in the safety of the project’s
        owner’s rights, decentralization of the funding mechanisms around the
        schools, and providing a solid foundation for the later blockchain use
        cases which can be utilized through SUCoin.
      </div>
      <br />
      <div className="about-title">Project Members</div>
      <br />
      <div className="about-project-members">
        <div className="grid-container">
          {developers.map((developer, index) => (
            <Card
              key={index}
              shadow="sm"
              p="xs"
              radius="md"
              sx={{ width: "230px" }}>
              <Card.Section>
                {developer.image ? (
                  <Image src={developer.image} height={250} />
                ) : (
                  <Avatar
                    size="xl"
                    sx={{
                      width: "230px",
                      height: "250px",
                    }}
                  />
                )}
              </Card.Section>

              <Group position="apart" mt="md" mb="xs">
                <Text weight={500} sx={{ fontFamily: "Montserrat" }}>
                  {developer.name}
                </Text>
              </Group>
              <Group position="apart" mt="md" mb="xs">
                <Badge variant="dark" sx={{ backgroundColor: "#173a6a" }}>
                  <Text sx={{ fontFamily: "Montserrat" }}>
                    {developer.role}
                  </Text>
                </Badge>
              </Group>

              <Group position="apart" mt="md" mb="xs">
                <Text
                  size="sm"
                  color="dimmed"
                  sx={{ fontFamily: "Montserrat" }}>
                  {developer.email}
                </Text>
              </Group>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
