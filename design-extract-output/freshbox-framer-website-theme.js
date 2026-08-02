// React Theme — extracted from https://freshbox.framer.website
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
 *   };
 *   fonts: {
    body: string;
    heading: string;
 *   };
 *   fontSizes: {
    '12': string;
    '14': string;
    '16': string;
    '18': string;
    '20': string;
    '24': string;
    '32': string;
    '48': string;
    '72': string;
    '80': string;
 *   };
 *   space: {
    '1': string;
    '30': string;
    '40': string;
    '52': string;
    '60': string;
    '88': string;
    '100': string;
    '120': string;
    '130': string;
    '150': string;
    '416': string;
    '436': string;
 *   };
 *   radii: {
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    xs: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#5f070d",
    "secondary": "#fc9e25",
    "accent": "#920711",
    "background": "#fff7e8",
    "foreground": "#000000",
    "neutral50": "#000000",
    "neutral100": "#ffffff",
    "neutral200": "#e9e9e9",
    "neutral300": "#7f675c",
    "neutral400": "#fff7e8"
  },
  "fonts": {
    "body": "'Times', sans-serif",
    "heading": "'Tanker', sans-serif"
  },
  "fontSizes": {
    "12": "12px",
    "14": "14px",
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "24": "24px",
    "32": "32px",
    "48": "48px",
    "72": "72px",
    "80": "80px"
  },
  "space": {
    "1": "1px",
    "30": "30px",
    "40": "40px",
    "52": "52px",
    "60": "60px",
    "88": "88px",
    "100": "100px",
    "120": "120px",
    "130": "130px",
    "150": "150px",
    "416": "416px",
    "436": "436px"
  },
  "radii": {
    "md": "10px",
    "lg": "16px",
    "xl": "20px",
    "full": "999px"
  },
  "shadows": {
    "sm": "rgb(0, 0, 0) 0px 0px 0px 1px inset",
    "xs": "rgba(0, 0, 0, 0.17) 0px 0.602187px 1.56569px -1.5px, rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -3px, rgba(0, 0, 0, 0.02) 0px 10px 26px -4.5px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#5f070d",
      "light": "hsl(356, 86%, 35%)",
      "dark": "hsl(356, 86%, 10%)"
    },
    "secondary": {
      "main": "#fc9e25",
      "light": "hsl(34, 97%, 72%)",
      "dark": "hsl(34, 97%, 42%)"
    },
    "background": {
      "default": "#fff7e8",
      "paper": "#920711"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#0000ee"
    }
  },
  "typography": {
    "fontFamily": "'Inter Display', sans-serif",
    "h1": {
      "fontSize": "32px",
      "fontWeight": "400",
      "lineHeight": "38.4px",
      "fontFamily": "'Tanker', sans-serif"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "28.8px",
      "fontFamily": "'Tanker', sans-serif"
    },
    "h3": {
      "fontSize": "20px",
      "fontWeight": "600",
      "lineHeight": "34px",
      "fontFamily": "'Tanker', sans-serif"
    }
  },
  "shape": {
    "borderRadius": 10
  },
  "shadows": [
    "rgb(0, 0, 0) 0px 0px 0px 1px inset",
    "rgba(0, 0, 0, 0.17) 0px 0.602187px 1.56569px -1.5px, rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -3px, rgba(0, 0, 0, 0.02) 0px 10px 26px -4.5px"
  ]
};

export default theme;
