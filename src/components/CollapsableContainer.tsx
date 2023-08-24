import {
  Box,
  Collapse,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import { FiHelpCircle } from "react-icons/fi";
import {
  TbLayoutBottombarCollapse,
  TbLayoutNavbarCollapse,
} from "react-icons/tb";

const CollapsableContainer = ({
  children,
  title,
  style,
  titleComponents,
  subTitle,
  tooltipText,
}: {
  children: React.ReactNode;
  title: string;
  style?: React.CSSProperties;
  titleComponents?: React.ReactNode | React.ReactNode[];
  subTitle?: string;
  tooltipText?: string;
}) => {
  const [show, setShow] = React.useState(true);

  const handleToggle = () => setShow(!show);

  return (
    <Box style={style} w={"100%"}>
      <Flex
        my={"10px"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={5}
      >
        <Flex gap={"10px"} alignItems={"center"}>
          <IconButton
            size={"sm"}
            aria-label="Minimize container"
            icon={
              show ? <TbLayoutNavbarCollapse /> : <TbLayoutBottombarCollapse />
            }
            onClick={handleToggle}
          />
          <Heading fontSize={"xl"}>{title}</Heading>
          {tooltipText && (
            <Tooltip label={tooltipText}>
              <IconButton size={"sm"} aria-label="help popover">
                <FiHelpCircle />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
        {titleComponents}
      </Flex>
      {subTitle && (
        <Text mb="10px" mt="-10px" color={"gray.500"}>
          {subTitle}
        </Text>
      )}

      <Collapse in={show}>
        <div>{children}</div>
      </Collapse>
      {!show && <Divider />}
    </Box>
  );
};

export default CollapsableContainer;
