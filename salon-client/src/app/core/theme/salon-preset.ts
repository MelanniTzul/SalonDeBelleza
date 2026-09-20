import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

// Paleta vino del diseño. El tono 700 es el vino principal (#6E2142).
export const SalonPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#FBF2F5",
      100: "#F5E2E9",
      200: "#ECC6D4",
      300: "#DD9BB4",
      400: "#C46B8E",
      500: "#A3416B",
      600: "#872F55",
      700: "#6E2142",
      800: "#5A1A36",
      900: "#4C1730",
      950: "#2E0D1D"
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.700}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.900}"
        }
      }
    }
  }
});
