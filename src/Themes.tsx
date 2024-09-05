import { createTheme } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const IconTheme = createTheme({
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: "#00000098",
                    cursor: "pointer",
                    "&:hover": {
                        color: "#000000"
                    }
                }
            },
        }
    }
});

export const ButtonTheme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: "#007fbf",
                    height: "100%",
                    cursor: "pointer",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#0070a8"
                    }
                }
            },
        }
    }
});

export const PaginationTheme = createTheme({
    components: {
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    backgroundColor: "#007fbf",
                    height: "100%",
                    cursor: "pointer",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#0070a8"
                    }
                }
            },
        }
    }
});


export const OrderDropDownTheme = createTheme({
    components: {
        MuiSelect: {
            defaultProps: {
                IconComponent: KeyboardArrowDownIcon
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    styles: {
                        BorderLeft: "3px solid #00",
                        backgroundColor: "#452341",
                        color: "#452341",
                    }
                }
            }
        }
    }
});