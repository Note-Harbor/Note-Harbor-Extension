const unimplementedColor = "#F00BA7";
const themes = {
    light: {
        text: "#000000",
        placeholder: "#747474",
        background: "#97BCC7",
        foreground: "#F2F1EF",
        codeblocks: "#CFCFCF",
        hover: "#135473",
        click: "#053D57",
        border: "#053D57",
        accent: "#006884",
        accentText: "#F2F1EF"
    },
    dark: {
        text: "#E6E6E6",
        placeholder: "#A0A0A0",
        background: "#181818",
        foreground: "#2A2A2A",
        codeblocks: "#3A3A3A",
        hover: "#444444",
        click: "#333333",
        border: "#383838", /* no border, same as foreground */
        accent: "#505050",
        accentText: "#E0E0E0"
    },
    matcha: {
        text: "#5A4632",
        placeholder: "#84715B",
        background: "#EDE3C9",
        foreground: "#FFF8E5",
        codeblocks: "#DAC3A3",
        hover: "#8A9A5B",
        click: "#7A8B4B",
        border: "#A98467",
        accent: "#A0B762",
        accentText: "#FFF8E5"
    },
    nebula: {
        text: "#e2dbf0",         // Light gray for readability
        placeholder: "#A693B0",  // Soft lavender-gray
        background: "#121022",   // Deep midnight purple
        foreground: "#282143",   // Rich dark purple for contrast
        codeblocks: "#4A3B6A",   // Muted violet for coding areas
        hover: "#66001d",        // Soft muted purple-red for interaction
        click: "#4d0016",        // Slightly deeper shade for active feedback
        border: "#5B4B8A",       // Warm purple for smooth contrast
        accent: "#99002b",       // Deep wine red for buttons (less distracting)
        accentText: "#DDD1E3"    // Light gray text for visibility
    }
}