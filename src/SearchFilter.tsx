import { 
    Box, 
    Button, 
    FormControl, 
    Grid, 
    MenuItem, 
    Modal, 
    Paper, 
    Select, 
    SelectChangeEvent, 
    TextField, 
    Typography 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { ThemeProvider } from "@emotion/react";
import { ButtonTheme, OrderDropDownTheme } from "./Themes";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Order } from "./api/OrderHandler";


function CustomerSearch({ GetValue = () => {} }) {

    return (
        <Box>
            <TextField 
                id="outlined-basic" 
                label="Customer Search" 
                variant="outlined" 
                size="small"
                InputProps={{
                    style: {
                        borderTopRightRadius: "0px",
                        borderBottomRightRadius: "0px"
                    }
                }}
            />
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    color="primary"
                    sx={{
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px"
                    }}
                >
                    <Box
                        display={"flex"}
                        justifyContent={"center"}
                        alignContent={"center"}
                    >
                        <SearchIcon 
                            sx={{
                                color: "#fff"
                            }}

                            fontSize="medium"
                        />
                    </Box>
                </Button>
            </ThemeProvider>
        </Box>
    );
}

function CreateOrderModal({ setClosed = (): void => {}, isOpen = false }) {

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: "2rem"
    }

    return (
        <Modal
            open={isOpen}
            onClose={setClosed}
            aria-labelledby="create-order-modal"
            aria-describedby="Creates a new order."
        >
            <Paper 
                sx={modalStyle}    
            >
                <Grid container spacing={1}>
                    <Grid item lg={6}>
                        <TextField
                            id="create-order-id"
                            label="Order Id"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                    </Grid>

                    <Grid item lg={3}>
                        <TextField
                            id="create-order-created-by"
                            label="Created By"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    <Grid item lg={3}>
                        <TextField
                            id="create-customer-name"
                            label="Customer"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    <Grid item lg={3}>
                        <OrderType />
                    </Grid>
                </Grid>

            </Paper>
        </Modal>
    );
}
function CreateOrder() {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    let addIcon = <AddIcon 
                    sx={{ color: "#fff" }}
                    fontSize="small"
                />
    return (
        <Box>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    startIcon={addIcon}
                    onClick={handleOpen}
                >
                    Create Order
                </Button>
            </ThemeProvider>
            <CreateOrderModal setClosed={handleClose} isOpen={open}/>
        </Box>
    );
}

function DeleteSelected({ GetData = ( selectedOrders: string[] ): void => {} }) {

    let deleteIcon = <DeleteIcon 
                    sx={{ color: "#fff" }}
                    fontSize="small"
                />
    return (
        <Box>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    startIcon={deleteIcon}
                >
                    Delete Selected
                </Button>
            </ThemeProvider>
        </Box>
    );
}

function OrderType({ GetData = ( selectedOrderType: string ): void => {} }) {

    let [ orderType, setOrderType ] = useState("_");
    const updateOrderType =  ( event: SelectChangeEvent ): void => {
        setOrderType(event.target.value);
    }
    return (
        <Box minWidth={256}>
                <FormControl fullWidth>
                    <ThemeProvider theme={OrderDropDownTheme}>
                        <Select
                            labelId="order-type-label"
                            value={orderType}
                            onChange={updateOrderType}
                            size="small"
                            IconComponent={KeyboardArrowDown}
                        >
                            <MenuItem value={"_"}>Order Type</MenuItem>
                            <MenuItem value={"Standard"}>Standard</MenuItem>
                            <MenuItem value={"SaleOrder"}>Sale Order</MenuItem>
                            <MenuItem value={"PurchaseOrder"}>Purchase Order</MenuItem>
                            <MenuItem value={"TransferOrder"}>Transfer Order</MenuItem>
                            <MenuItem value={"ReturnOrder"}>Return Order</MenuItem>
                        </Select>
                    </ThemeProvider>
                </FormControl>
        </Box>
    );
}


export function SearchFilter() {

    return (
        <Box
            display={"flex"}
            alignContent={"left"}
            justifyContent={"left"}
            gap={"1rem"}
        >
            <CustomerSearch />
            <CreateOrder />
            <DeleteSelected />
            <OrderType />
        </Box>
    );
}