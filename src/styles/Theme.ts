import type { StyleFunctionProps } from "@chakra-ui/react";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
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
const greenPalette = {
  100: "#DDFFBB",
  200: "#e1fcd4", //Button bg and icon color in dark mode
  300: "#DDFFBB",
  400: "#C7E9B0",
  500: "#0fa824", //button bg in light mode, some headings
  600: "#2a8800", // Icons, buttons and menu text in light mode, only icons in dark mode
  700: "#475740", // Outline and dividers
  800: "#212e1b",
  900: "#212e1b",
};

export const theme = extendTheme(
  {
    config: {
      initialColorMode: "dark",
      useSystemColorMode: true,
    },
    colors: {
      //green brand
      brand: greenPalette,
      hyperlink: "#007cc1",
      /* brand: purplePalette, */
    },
    components: {
      Accordion: accordionTheme,

      Button: {
        // 1. We can update the base styles
        /* baseStyle: { */
        /*   fontWeight: "bold", // Normally, it is "semibold" */
        /* }, */
        // 2. We can add a new button size or extend existing
        /* sizes: { */
        /*   xl: { */
        /*     h: "56px", */
        /*     fontSize: "lg", */
        /*     px: "32px", */
        /*   }, */
        /* }, */
        // 3. We can add a new visual variant
        variants: {
          /* "with-shadow": { */
          /*   bg: "red.400", */
          /*   boxShadow: "0 0 2px 2px #efdfde", */
          /* }, */
          // 4. We can override existing variants
          /* solid: (props: StyleFunctionProps) => ({ */
          /*   bg: props.colorMode === "dark" ? "red.300" : "red.500", */
          /* }), */
          // 5. We can add responsive variants
          /* sm: { */
          /* bg: greenPalette[300], */
          /* fontSize: "md", */
          /* }, */
        },
        // 6. We can overwrite defaultProps
        defaultProps: {
          /* size: "lg", // default is md */
          /* variant: "sm", // default is solid */
          /* colorScheme: "green", // default is gray */
        },
      },
    },

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
  },
  withDefaultColorScheme({ colorScheme: "brand" }),
);
