import { AppBar, AppBarTypeMap, Box, Grid, Paper, SvgIcon, SvgIconProps, ThemeProvider, Typography } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useState } from "react";
import { IconTheme } from "./Themes";
import { CustomDrawer } from "./CustomDrawer";

function SpotIcon(props: SvgIconProps) {
    return (
        <SvgIcon 
            {...props}
        >
            <svg width="100%" height="100%" viewBox="0 0 260 239" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width="260" height="239" fill="url(#pattern0)"/>
                <defs>
                    <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image0" transform="scale(0.00384615 0.0041841)"/>
                    </pattern>
                    <image id="image0" width="260" height="239" xlinkHref="data:image/png;base64,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"/>
                </defs>
            </svg>
        </SvgIcon>
    );
}

export function Navbar() {

    const [ drawerOpen, setDrawerOpen ] = useState<boolean>(false);
    return (
        <AppBar
            sx={{ 
                backgroundColor: '#00000010',
                padding: "none"
            }}
            position="static" 
            elevation={1}
        >
            <Grid 
                container 
                padding={"1rem"}
            >
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                    <Box
                        display={"flex"}
                        alignContent={"left"}
                        justifyContent={"left"}
                    >
                        {/* Fix the alignment in this group */}
                        <Box
                            display={"flex"}
                            alignContent={"center"}
                            justifyContent={"center"}
                            gap={"1rem"}
                            sx={{
                                cursor: "pointer"
                            }}
                            onClick={() => window.location.assign("/")}
                        >
                            <SpotIcon fontSize="medium"/>
                            <Typography color={"black"} height={"min-content"}>Home</Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                    <Box
                        display={"flex"}
                        alignContent={"right"}
                        justifyContent={"right"}
                    >
                        <Box
                            display={"flex"}
                            alignContent={"center"}
                            justifyContent={"center"}
                            gap={"1rem"}
                        >
                            <ThemeProvider theme={IconTheme}>
                                <SettingsIcon />
                                <AccountCircleIcon onClick={() => setDrawerOpen(true)} />
                                <CustomDrawer open={drawerOpen} toggleDrawer={setDrawerOpen}/>
                            </ThemeProvider>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </AppBar>
    );
}