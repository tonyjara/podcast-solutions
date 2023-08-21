import React from "react";
import { Text, Tooltip } from "@chakra-ui/react";

const TextCell = ({
  text,
  hover,
  shortenString,
}: {
  text?: string;
  hover?: string | React.ReactNode;
  shortenString?: boolean;
}) => {
  return (
    <Tooltip label={hover}>
      <Text
        style={
          shortenString
            ? {
                textOverflow: "ellipsis",
                width: "100px",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }
            : {}
        }
        fontSize="sm"
        fontWeight="bold"
      >
        {text}
      </Text>
    </Tooltip>
  );
};

export default TextCell;
