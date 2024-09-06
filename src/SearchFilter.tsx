import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputAdornment,
    MenuItem,
    Modal,
    Paper,
    Select,
    SelectChangeEvent,
    Slide,
    Snackbar,
    TextField,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { ThemeProvider } from "@emotion/react";
import { ButtonTheme, OrderDropDownTheme } from "./Themes";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMemo, useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Order, OrderClassification, OrderRequest } from "./api/OrderHandler";
import { CustomAutocomplete } from "./CustomAutocomplete";
import { Customer, User } from "./api/UserHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callApi, callApi2 } from "./api";
import { TableMode, useApiResponse, useTable } from "./api/contexts"
import { useLocalStorage } from "@uidotdev/usehooks";

const draftDateFormatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric", 
    month: "numeric", 
    year: "numeric",
    hour: "2-digit", 
    minute: "2-digit",
    second: "2-digit"
};

export function CustomerSearch({  }) {
    
    const [ customer, setCustomer ] = useState<string>("");
    const { state, dispatch } = useTable();
    
    const handleCustomerSubmission = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        dispatch(prevState => ({
            ...prevState,
            mode: "Specific-Customer",
            CustomerSelection: customer
        }));
    }

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
                        borderBottomRightRadius: "0px",
                        padding: "none"
                    }
                }}
                value={customer}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomer(event.target.value);
                }}

                sx={{
                    width: {
                        xs: "82%",
                        md: "77%"
                    }
                }}
            />
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    color="primary"
                    sx={{
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                        height: "2.85em"
                    }}
                    onClick={handleCustomerSubmission}
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
function CreateOrderModal({
    setClosed = (): void => { },
    handleSubmit = (order: OrderRequest): void => { },
    createDraft = (order: OrderRequest): void => { },
    isOpen = false
}) {
    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: {
            xs: "2rem",
            md: "2rem"
        },
        width: {
            xs: "80%",
            md: "40%",
            lg: "30%",
            xl: "20%",
        } 
    }

    const FIVE_MINUTES = 1000 * 60 * 5;

    const userData = useQuery({
        queryKey: ["my-users"],
        queryFn: () => callApi<User[]>("User"),
        refetchOnWindowFocus: true,
        staleTime: FIVE_MINUTES,
    });

    const customerData = useQuery({
        queryKey: ["my-customers"],
        queryFn: () => callApi<Customer[]>("Customer"),
        refetchOnWindowFocus: true,
        staleTime: FIVE_MINUTES,
    });

    const [formData, setFormData] = useState<OrderRequest>({
        Type: "Standard",
        CustomerName: "",
        Username: ""
    });

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

                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <CustomAutocomplete
                            label="User"
                            isLoading={userData.isLoading}
                            getLabel={option => option.username}
                            requestFailed={userData.isError == true}
                            options={userData.data}
                            onChange={value => {

                                if (value == null) return;
                                setFormData(prevState => ({
                                    ...prevState,
                                    Username: value
                                }));
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <CustomAutocomplete
                            label="Customer"
                            isLoading={customerData.isLoading}
                            getLabel={option => option.name}
                            requestFailed={customerData.isError == true}
                            options={customerData.data}
                            onChange={value => {

                                if (value == null) return;
                                setFormData(prevState => ({
                                    ...prevState,
                                    CustomerName: value
                                }));
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <OrderType
                            mode="create"
                            getValue={value => {
                                setFormData(prevState => ({
                                    ...prevState,
                                    Type: value
                                }));
                            }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem"
                }} />

                <Box
                    display={"flex"}
                    justifyContent={"end"}
                    alignContent={"end"}
                >
                    <ThemeProvider theme={ButtonTheme}>
                        <Box
                            display={"flex"}
                            gap={2}
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    createDraft(formData);
                                    setClosed();
                                }}
                            >Save draft</Button>

                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleSubmit(formData);
                                    setClosed();
                                }}
                            >Submit</Button>

                        </Box>
                    </ThemeProvider>
                </Box>

            </Paper>
        </Modal>
    );
}

function CreateOrder() {

    const [open, setOpen] = useState(false);
    const { dispatch } = useTable();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // add loading animation
    const {
        data,
        isPending,
        isError,
        status,
        mutate
    } = useMutation({
        mutationFn: (orderData: OrderRequest) => {
            return callApi2(
                "Orders",
                "post",
                "dev",
                orderData
            );
        },
    });
    const submitOrder = (orderData: OrderRequest) => {
        mutate(orderData, {
            onSuccess: (data, variables, context) => {
                dispatch(prevState => ({
                    ...prevState,
                    createCount: prevState.createCount + 1
                }));
            }
        });
    }

    const [ orderDrafts, saveDraft ] = useLocalStorage("Orders", {})
    const createDraft = (orderData: OrderRequest) => {
        const draftIsIncomplete = (
            orderData.CustomerName.length < 1 ||
            orderData.Type.length < 1 ||
            orderData.Username.length < 1
        );

        if (draftIsIncomplete) {
            return;
        }

        let date = new Date().toLocaleDateString("en-us", draftDateFormatOptions);
        saveDraft(prevState => ({
            ...prevState,
            [date]: {
                ...orderData,
                date: date
            }
        }));

        console.log("drafts: ", orderDrafts);
    }

    let addIcon = <AddIcon
        sx={{ color: "#fff" }}
        fontSize="small"
    />
    return (
        <>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    startIcon={addIcon}
                    onClick={handleOpen}
                >
                    Create Order
                </Button>
            </ThemeProvider>
            <CreateOrderModal
                handleSubmit={submitOrder}
                setClosed={handleClose}
                createDraft={createDraft}
                isOpen={open}
            />
        </>
    );
}

function DeleteSelected() {

    const { state, dispatch } = useTable();
    const [ isLoading, setIsLoading ] = useState(false);
    const { data, mutate } = useMutation({
        mutationFn: async (selectedOrders: string[]) => {
            setIsLoading(true);
            return await callApi2<number>(
                "Orders",
                "delete",
                "dev",
                selectedOrders
            );
        }
    });

    const handleDelete = () => {
        mutate(state.selectedOrders, {
            onSettled: (data, variables, context) => {
                dispatch(prevState => ({
                    ...prevState,
                    deleteCount: prevState.deleteCount + 1
                }));
                setIsLoading(false);
            }
        });
    }

    let deleteIcon = isLoading ? 
        <CircularProgress size="1.3rem" sx={{ color: "#fff"}} />:
        <DeleteIcon
            sx={{ color: "#fff" }}
            fontSize="small"
        />;

    return (
        <>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    startIcon={deleteIcon}
                    onClick={handleDelete}
                >
                    Delete Selected
                </Button>
            </ThemeProvider>
        </>
    );
}

interface OrderTypeProps {
    getValue: (selectedOrderType: OrderClassification) => void,
    mode: "filter" | "create"
}

function OrderType({ 
    getValue = (selectedOrderType: OrderClassification): void => {},
    mode = "filter"    
}: OrderTypeProps) {

    let [ orderType, setOrderType ] = useState("_");
    const { dispatch } = useTable();

    const updateOrderType = (event: SelectChangeEvent): void => {
        setOrderType(event.target.value);
        getValue(event.target.value as OrderClassification);

        if (mode === "create") return;
        let dispatchValue = event.target.value === "_"? "" : event.target.value;
        let modeValue = event.target.value === "_"? "All-Orders" : "Specific-Type";
        dispatch(prevState => ({
            ...prevState,
            page: 1,
            mode: modeValue as TableMode,
            OrderTypeSelection: dispatchValue as OrderClassification
        }));
    }

    return (
        <>
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
        </>
    );
}

function ServerToastMessage() {

    const EIGHT_SECONDS = 8000;
    const { state, toastOpen, setToastOpen } = useApiResponse();
    
    const toastNotification = useMemo(() => {
        let toastElement = <></>;
        if (state.isError) {
            toastElement = <Alert elevation={4} severity="error">{state.message}</Alert>
        } else {
            toastElement = <Alert elevation={4} severity="success">{state.message}</Alert>
        }
    
        console.log("Toast fired", toastOpen, state.message);
        const handleClose = (event: React.SyntheticEvent | Event, reason: string) => {
            if (reason === "clickaway") {
                return;
            }
            setToastOpen(false);
        }
        
        return <Snackbar 
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    open={toastOpen}
                    TransitionComponent={(props) => (
                        <Slide 
                            {...props}
                            direction="down" 
                        />
                    )}
                    onClose={handleClose}
                    autoHideDuration={2200}
                >
                    <Box>
                        {toastElement}
                    </Box>
                </Snackbar>
}, [state.message, state.isError, toastOpen]);

    return toastNotification;
}


export function SearchFilter() {

    return (
        <>
            <Box
                display={"flex"}
                alignContent={"left"}
                justifyContent={"left"}
                gap={"1rem"}

                sx={{
                    display: {
                        xs: "none",
                        sm: "none",
                        md: "flex",
                        lg: "flex",
                        xl: "flex"
                    }
                }}
            >
                <CustomerSearch />
                <CreateOrder />
                <DeleteSelected />
                <Box width={"300px"}>
                    <OrderType getValue={value => {}} mode="filter" />
                </Box>
                <ServerToastMessage />
            </Box>

            <Box
                sx={{
                    display: {
                        xs: 'flex',
                        sm: 'flex',
                        md: "none",
                        lg: "none",
                        xl: "none"
                    }
                }}

                justifyContent={"center"}
                alignContent={"center"}
            >
                <Box >
                    <Grid container gap={1} columnGap={8}>
                        
                        <Grid item xs={12} sm={12}>
                            <CustomerSearch />
                        </Grid>


                        <Grid item xs={12} sm={12}>
                            <OrderType getValue={value => {}} mode="filter" />
                        </Grid>

                        <Grid container>
                            <Grid item xs={6} sm={6}>
                                <CreateOrder />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <DeleteSelected />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </Box>
        </>
    );
}