import { Box, Button, IconOwnProps, SvgIconTypeMap, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

function CustomerSearch({ GetValue = () => {} }) {
    let searchIcon = <SearchIcon 
                        sx={{
                            color: "#fff",
                            backgroundColor: ""
                        }}

                    />
    return (
        <Box>
            <TextField 
                id="outlined-basic" 
                label="Customer Search" 
                variant="outlined" 
                size="small"
            />
            <Button 
                startIcon={searchIcon}
            />
        </Box>
    );
}
export function SearchFilter() {

    return (
        <Box
            padding={"1rem 0 1rem 0"}
            display={"flex"}
            alignContent={"left"}
            justifyContent={"left"}
            gap={"1rem"}
        >
            <CustomerSearch />
        </Box>
    );
}