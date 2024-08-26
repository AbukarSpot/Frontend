import {
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    MenuItem,
    Modal,
    Paper,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { ThemeProvider } from "@emotion/react";
import { ButtonTheme, OrderDropDownTheme } from "./Themes";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { OrderClassification, OrderRequest } from "./api/OrderHandler";
import { CustomAutocomplete } from "./CustomAutocomplete";
import { Customer, User } from "./api/UserHandler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi, callApi2 } from "./api";
import { useTable } from "./api/contexts"
import { TableMode } from "./redux/tableReducer";
import { error } from "console";

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
                        borderBottomRightRadius: "0px"
                    }
                }}
                value={customer}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomer(event.target.value);
                }}
            />
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    color="primary"
                    sx={{
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "0px",
                        height: "100%"
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
    isOpen = false
}) {
    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: "2rem"
    }

    const FIVE_MINUTES = 1000 * 60 * 5;
    const queryClient = useQueryClient();

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

                    <Grid item sm={12} md={6} lg={6}>
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

                    <Grid item sm={12} md={6} lg={6}>
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

                    <Grid item sm={12} md={6} lg={6}>
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
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleSubmit(formData);
                                setClosed();
                            }}
                        >Submit</Button>
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
                "prod",
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

    let addIcon = <AddIcon
        sx={{ color: "#fff" }}
        fontSize="small"
    />
    return (
        <Box>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    fullWidth
                    startIcon={addIcon}
                    onClick={handleOpen}
                >
                    Create Order
                </Button>
            </ThemeProvider>
            <CreateOrderModal
                handleSubmit={submitOrder}
                setClosed={handleClose}
                isOpen={open}
            />
        </Box>
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
                "prod",
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
        <Box>
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    fullWidth
                    startIcon={deleteIcon}
                    onClick={handleDelete}
                >
                    Delete Selected
                </Button>
            </ThemeProvider>
        </Box>
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

        let dispatchValue = event.target.value === "_"? "" : event.target.value;
        let modeValue = event.target.value === "_"? "All-Orders" : "Specific-Type";
        dispatch(prevState => ({
            ...prevState,
            mode: modeValue as TableMode,
            OrderTypeSelection: dispatchValue as OrderClassification
        }));
    }

    return (
        <Box>
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
            </Box>

            <Box
                sx={{
                    maxWidth: "500px",
                    display: {
                        md: "none",
                        lg: "none",
                        xl: "none"
                    }
                }}
            >
                <Grid container gap={1} columnGap={8}>
                    
                    <Grid item sm={12}>
                        <CustomerSearch />
                    </Grid>


                    <Grid item sm={12}>
                        <OrderType getValue={value => {}} mode="filter" />
                    </Grid>

                    <Grid item sm={5}>
                        <CreateOrder />
                    </Grid>

                    <Grid item sm={5}>
                        <DeleteSelected />
                    </Grid>

                </Grid>
            </Box>
        </>
    );
}