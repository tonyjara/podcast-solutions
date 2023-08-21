import type { StyleFunctionProps } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

import { accordionAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    borderStyle: "none",
  },
});

export const accordionTheme = defineMultiStyleConfig({ baseStyle });

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      300: "#6e53c9",
      400: "#512cd1",
      500: "#5e34eb",
      600: "#5129d9",
      700: "#4e23de",
      800: "#4013d6",
    },
  },
  components: { Accordion: accordionTheme },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        fontFamily: "body",
        // color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode("white", "gray.800")(props),
        lineHeight: "base",
      },
    }),
  },
});
