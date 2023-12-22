import { useEffect, useState } from "react";
import {
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
} from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons";
import { dotnetAPI } from "../../request/AxiosInterceptor";
import {
  changeUserStatus,
  promoteUserToAdmin,
  deleteUser,
  RenounceUserfromAdmin,
} from "../../interactions/user";
import { useToast } from "@chakra-ui/react";

export const statuses = [
  { value: 0, label: "Base" },
  { value: 1, label: "Whitelist" },
  { value: 2, label: "Blacklist" },
  { value: 3, label: "Viewer" },
  { value: 4, label: "Admin" },
];

export default function UserBox({ selected, deleted }) {
  const [users, setUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [select, setSelect] = useState();
  const [status, setStatus] = useState();
  const [statusChanged, setStatusChanged] = useState(false);

  const toast = useToast();

  const handleSearchChange = (e) => {
    var userL = [];
    const val = e.target.value.toLocaleLowerCase();
    if (val == "" || val == null) {
      setUserList(users);
      return;
    }
    users.forEach((u) => {
      console.log(u);
      var name = u.name + " " + u.surname;
      if (name.toLocaleLowerCase().includes(val)) {
        userL.push(u);
      }
    });
    setUserList(userL);
  };

  const handleSelect = (e, user) => {
    setSelect(user);
    setStatus(statuses.find((stat) => stat.label == user.role));
    setStatusChanged(false);
  };

  const handleStatusSelect = (e) => {
    const stat = statuses.find((stat) => stat.value == e.target.value);

    setStatus(stat);
    if (select.role != stat.label) {
      setStatusChanged(true);
      return;
    }
    setStatusChanged(false);
  };

  useEffect(() => {
    dotnetAPI.get(`/User/GetAll`).then((res) => {
      const users = res.data.data;
      const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sortedUsers);
      selected(sortedUsers.at(0));
      setSelect(sortedUsers.at(0));
      setStatus(statuses.find((stat) => stat.label === sortedUsers.at(0).role));
    });
  }, [selected]);

  useEffect(() => {
    setUserList(users);
  }, [users]);

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
            placeholder="Search User"
            onChange={handleSearchChange}
          />
        </InputGroup>
        <div className="admin-scroll-box">
          {userList.map((user) => (
            <button key={user.username} onClick={(e) => handleSelect(e, user)}>
              {user.name} {user.surname}
            </button>
          ))}
        </div>
        {/*<Select  onChange={handleChange}>
                    {users.map((user) => ( 
                        <option key={user.address} value={user.address}>
                            {user.name}
                        </option>
                    ))}
                </Select>*/}
      </div>
      {select && (
        <div className="admin-info-box">
          <p className="info-name">
            {select.name} {select.surname}
          </p>
          <div className="info-field">
            <p className="info-field-name">Username:</p>
            <p className="info-value">{select.username}</p>
          </div>
          <div className="info-field">
            <p className="info-field-name">Email:</p>
            <p className="info-value">{select.mailAddress}</p>
          </div>
          <div className="info-field">
            <p className="info-field-name">Wallet:</p>
            <p className="info-value">{select.address}</p>
          </div>
          <div className="user-controls">
            <div className="user-controls-col">
              <label className="user-controls-label">Role</label>
              <Select
                size={"lg"}
                value={status.value}
                onChange={handleStatusSelect}>
                {statuses.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                    hidden={status.label == "Admin"}>
                    {status.label}
                  </option>
                ))}
              </Select>
              {statusChanged && (
                <Button
                  width={"100%"}
                  colorScheme="blue"
                  mt={"4"}
                  onClick={() =>
                    changeUserStatus(toast, select, status).then((success) => {
                      if (success) {
                        select.role = status.label;
                        setStatusChanged(false);
                      }
                    })
                  }>
                  Update User Status
                </Button>
              )}
            </div>
            <div className="user-controls-col">
              <Button
                onClick={() =>
                  deleteUser(toast, select).then((success) => {
                    if (success) {
                      const filteredUsers = users.filter(
                        (user) => user.id !== select.id
                      );
                      setUsers(filteredUsers);
                      setSelect(filteredUsers.at(0));
                    }
                  })
                }
                colorScheme="red"
                variant="outline"
                size="lg">
                Delete User
              </Button>
              <Button
                onClick={() => promoteUserToAdmin(toast, select)}
                colorScheme="green"
                variant="outline"
                size="lg">
                {" "}
                Promote to Admin
              </Button>
              <Button
                onClick={() => RenounceUserfromAdmin(toast, select)}
                colorScheme="red"
                variant="outline"
                size="lg"
                hidden={select.role !== "Admin"}>
                {" "}
                Renounce Admin Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
