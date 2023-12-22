import { Select, Button } from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { changeUserStatus } from "../../interactions/user";
import { useToast } from "@chakra-ui/react";

const statuses = [
  { value: 0, label: "Base" },
  { value: 1, label: "Whitelist" },
  { value: 2, label: "Blacklist" },
  { value: 3, label: "Viewer" },
];

export default function PromotionBox({ selected }) {
  const [selectedValue, setSelectedValue] = useState(null);

  const toast = useToast();

  const [status, setStatus] = useState(selectedValue ?? 0);

  useEffect(() => {
    const result = statuses.find((stat) => stat.label === selected.role)?.value;

    setSelectedValue(result ?? 0);
    setStatus(result ?? 0);
  }, [selected]);

  return (
    <div>
      <Select
        size={"lg"}
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
        }}>
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>

      {selectedValue != null &&
        selectedValue.toString() !== status.toString() && (
          <Button
            width={"100%"}
            colorScheme="blue"
            mt={"4"}
            onClick={() => changeUserStatus(toast, selected, status)}>
            Update User Status
          </Button>
        )}
    </div>
  );
}
