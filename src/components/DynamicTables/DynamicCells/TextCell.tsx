import React from "react";
import { Text, Tooltip } from "@chakra-ui/react";

const TextCell = ({
  text,
  hover,
  shortenString,
  color,
}: {
  text?: string;
  hover?: string | React.ReactNode;
  shortenString?: boolean;
  color?: string;
}) => {
  return (
    <Tooltip label={hover}>
      <Text
        color={color}
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
