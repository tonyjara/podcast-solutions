import {
  Box,
  Collapse,
  Divider,
  Flex,
  Heading,
  IconButton,
  Text,
} from "@chakra-ui/react";
import React from "react";
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
}: {
  children: React.ReactNode;
  title: string;
  style?: React.CSSProperties;
  titleComponents?: React.ReactNode | React.ReactNode[];
  subTitle?: string;
}) => {
  const [show, setShow] = React.useState(true);

  const handleToggle = () => setShow(!show);

  return (
    <Box style={style} w={"100%"}>
      <Flex
        mb={"20px"}
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
