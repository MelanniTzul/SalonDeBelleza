import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

// Paleta en blanco y negro. El tono 950 es el negro principal (#000000).
export const SalonPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#FAFAFA",
      100: "#F2F2F2",
      200: "#E5E5E5",
      300: "#D0D0D0",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#262626",
      800: "#171717",
      900: "#0A0A0A",
      950: "#000000"
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.950}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.700}"
        }
      }
    }
  }
});
