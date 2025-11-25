module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  },
  theme: {
    extend: {
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        full: "9999px",
      },
      colors: {
        primary: "var(--zmp-primary-color)",
        onPrimary: "#ffffff",
        secondary: "#E8DEF8", // M3 secondary container
        onSecondary: "#1D192B",
        surface: "#FDFDF5", // M3 surface
        onSurface: "#1C1B1F",
        surfaceVariant: "#E7E0EC",
        onSurfaceVariant: "#49454F",
        outline: "#79747E",
        gray: "#767A7F",
        divider: "#E9EBED",
        green: "#288F4E",
        background: "#FDFDF5", // M3 background (often same as surface)
        skeleton: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
};
