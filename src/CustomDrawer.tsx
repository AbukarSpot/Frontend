import { AutoGraphRounded, Drafts } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";

interface CustomDrawerProps {
    open: boolean,
    toggleDrawer: React.Dispatch<React.SetStateAction<boolean>>,
}

export function CustomDrawer({ open, toggleDrawer }: CustomDrawerProps) {
    
    return (<>
    <Drawer
        anchor="right"
        open={open}
        onClose={() => toggleDrawer(false)}
    >
        <List>
            <Box
                width={"200px"}
                role={"presentation"}
                paddingTop={"2rem"}
                display={"flex"}
                flexDirection={"column"}
                gap={1}
            >
                <ListItem key={"Drafts"} disablePadding>
                    <ListItemButton href="/drafts">
                        <ListItemIcon>
                            <Drafts />
                        </ListItemIcon>
                        <ListItemText primary={"Drafts"} />
                    </ListItemButton>
                </ListItem>

                <ListItem key={"Analytics"} disablePadding>
                    <ListItemButton href="/analytics">
                        <ListItemIcon>
                            <AutoGraphRounded />
                        </ListItemIcon>
                        <ListItemText primary={"Analytics"} />
                    </ListItemButton>
                </ListItem>
            </Box>
        </List>
    </Drawer>
    </>)
}