import { Alert, Autocomplete, Box, Button, Checkbox, CircularProgress, Divider, Fade, Grow, Modal, Pagination, PaginationItem, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography } from "@mui/material";
import { Order, OrderClassification, OrderTypeAutocompleteOptions } from "./api/OrderHandler";
import { UseMutateFunction, useMutation, useQuery } from "@tanstack/react-query";
import { callApi2 } from "./api";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useApiResponse, useTable } from "./api/contexts";
import { isError, useQuery  as useQuery2 } from "react-query";
import { All, Customer as CustomerType, CustomerAndType, PaginationCriteria, Type } from "./pagination";
import { User, Customer } from "./api/UserHandler";
import { useDebounce } from "@uidotdev/usehooks";

const MAX_ATTEMPTS = 5;
const FIVE_MINUTES = 1000 * 60 * 5;
const cellMap: {label: string, objectKey: keyof Order}[] = [
    { label: "Order ID", objectKey: "id" },
    { label: "Creation Date", objectKey: "date" },
    { label: "Created By", objectKey: "by" },
    { label: "Order Type", objectKey: "type" },
    { label: "Customer", objectKey: "customer" },

];

export type OrderMutationFunction = UseMutationResult<Order[], Error ,number, Order[]> 
interface OrderTableRowProps {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    page: number,
    users: string[],
    customers: string[]
} 

interface OrderPaginationRequest {
  criteria: PaginationCriteria,
  customerName: string | null,
  type: string | null
}

interface UpdateOrderRequest {
  value: string,
  key: string
}

interface CustomTableCheckBoxProps {
  orderId: string,
  selectOrder: (orderId: string, action: "push" | "pop") => void
} 

interface CustomTableRowProps {
  row: Order,
  rowId: number,
  users: string[],
  customers: string[],
  selectOrder: (orderId: string, action: "push" | "pop") => void
} 


interface CustomAutocompleteProps<T = any> {
  value: NonNullable<T> | undefined,
  options: readonly T[],
  colKey: string,
  mutationFn: UseMutateFunction<AxiosResponse<void, any>, AxiosError<unknown, any>, UpdateOrderRequest, unknown> | undefined,
  getValue: React.Dispatch<React.SetStateAction<Order>>,
  getOptionKey: ((option: T) => string | number) | undefined,
  getOptionLabel: ((option: T) => string) | undefined
} 

const orderTypeOptions: OrderTypeAutocompleteOptions[] = [
  {
    key: "Standard",
    label: "Standard"
  },
  {
    key: "SaleOrder",
    label: "Sale"
  },
  {
    key: "PurchaseOrder",
    label: "Purchase"
  },
  {
    key: "TransferOrder",
    label: "Transfer"
  },
  {
    key: "ReturnOrder",
    label: "Return"
  }
];

function CustomTableCheckBox({ orderId, selectOrder }: CustomTableCheckBoxProps) {

  return (
    <Checkbox onChange={event => {
      if (event.target.checked) {
        selectOrder(orderId, "push")
      } else {
        selectOrder(orderId, "pop")
      }
    }}/>
  )
}

function CustomAutocomplete<T = string>(
  {  value, 
     options, 
     colKey, 
     getValue, 
     mutationFn, 
     getOptionKey,
     getOptionLabel
  }: CustomAutocompleteProps<T>
  ) {
  // console.log(colKey, "options are", options);
  const [_value, setValue] = useState<NonNullable<T> | undefined>(value);
  const handleChange = (event: React.SyntheticEvent, value: NonNullable<T>) => {
    const newValue = typeof(value) === "string"? value: (value as any as OrderTypeAutocompleteOptions).key as string;
    const request: UpdateOrderRequest = {
      key: colKey,
      value: newValue
    }

    if (mutationFn !== undefined) {
      mutationFn(request,{
        onSuccess: () => {
          // keep the value as an obj when dealing with the state
          setValue(value as NonNullable<T>);
          getValue(prevState => ({
              ...prevState,
              [colKey]: newValue
            }));
        },

        onError: () => {
          // alert("update failed")
        }
      });
    }
    else {
      setValue(value);
      getValue(prevState => ({
          ...prevState,
          [colKey]: newValue
        }));
    }
  }

  return <>
      <Autocomplete
        value={_value} 
        options={options}
        getOptionKey={getOptionKey}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => <TextField 
                                    {...params}
                                    sx={{
                                      border: "hidden", 
                                      textAlign: "center" 
                                    }} 
                                    label="" 
                                  />
        }
        disableClearable
        sx={{
          "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
            border: "none"
          }
        }}
        
        onChange={handleChange}
      />
  </>
}

// debounce here and store data in state
function CustomTableRow({ row, rowId, selectOrder, users, customers }: CustomTableRowProps) {

  const [ order, setOrder ] = useState<Order>(row);
  const { state, dispatch, setToastOpen }= useApiResponse()
  const { dispatch: tableDispatch } = useTable();
  const [ prevState, setPrevState ] = useState<Order>(row);
  let value = orderTypeOptions.find(order => order.key === row["type"]);

  const updateMuatation = useMutation({
    mutationKey: [order],
    mutationFn: (orderRequest: UpdateOrderRequest) => {
      const request = {
        orderId: order.id,
        createdDate: order.date,
        username: order.by,
        orderType: order.type,
        customerName: order.customer,
        [orderRequest.key]: orderRequest.value
      };

      setToastOpen(false);
      return callApi2<void>(
        `Orders?orderId=${order.id}&createdDate=${order.date}&username=${request.username}&orderType=${request.orderType}&customerName=${request.customerName}`,
        "patch",
        "dev",
        request
      )
    },
    onSuccess: () => {
      console.log("success hit");
      dispatch({
        message: `Updated order: ${order.id}`,
        status: 200,
        isError: false
      });

      tableDispatch(prevState => ({
        ...prevState,
        updateCount: prevState.updateCount + 1
      }))
      setToastOpen(true);
    },
    onError: (error: AxiosError) => {
      console.log("errror hit");
      dispatch({
        message: `Unable to update ${order.id} at this time.`,
        status: error.code,
        isError: true
      });
      setToastOpen(true);
    }
  });

  return (<>
    <TableRow key={rowId}>
      <TableCell align="center">
        <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
      </TableCell>

      <TableCell align="center">
        {row["id"]}
      </TableCell>
      
      <TableCell align="center">
        {row["date"]}
      </TableCell>

      {/* add data */}
      <TableCell>
        <CustomAutocomplete 
          value={row["by"]} 
          options={users}
          colKey="username"
          getValue={setOrder}
          mutationFn={updateMuatation.mutate}
          getOptionKey={option => option} 
          getOptionLabel={option => option} 
        />
      </TableCell>

      <TableCell>
        <CustomAutocomplete<OrderTypeAutocompleteOptions>
          value={value} 
          options={orderTypeOptions}
          colKey="orderType"
          getValue={setOrder}
          mutationFn={updateMuatation.mutate}
          getOptionKey={option => option.key} 
          getOptionLabel={option => option.label}
        />
      </TableCell>

      <TableCell>
        <CustomAutocomplete
          value={row["customer"]} 
          options={customers} 
          colKey="customerName"
          getValue={setOrder}
          mutationFn={updateMuatation.mutate}
          getOptionKey={option => option} 
          getOptionLabel={option => option} 
        />
      </TableCell>
    </TableRow>
  </>);
}

function SpecificTypeAndCustomerResults({ page = 0, setIsLoading, users, customers }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-customer-type-${state.OrderTypeSelection}-${state.CustomerSelection}-orders-${page}-${state.createCount}-${state.deleteCount}-${state.updateCount}`],  
    queryFn: async () => {
          setIsLoading(true);
          const data = await callApi2<Order[]>(
              `filter/type/customer/${state.OrderTypeSelection}/${state.CustomerSelection}/${page}`, 
              "get", 
              "dev", 
              {
                  pageNumber: page,
                  customer: state.CustomerSelection,
                  type: state.OrderTypeSelection
              }
          );
          setIsLoading(false);
          return data as AxiosResponse<Order[]>;
      },
      retry: MAX_ATTEMPTS,
      retryDelay: 1000,
      staleTime: FIVE_MINUTES
  });

  
  return (<>
        {data?.data?.map((row, rowIndex) => {
          return <CustomTableRow 
                    rowId={rowIndex}
                    row={row}
                    selectOrder={selectOrder}
                    users={users}
                    customers={customers}
                  />
        })}
  </>)
}

function SpecificTypeResults({ page = 0, setIsLoading, users, customers }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-type-${state.OrderTypeSelection}-orders-${page}-${state.createCount}-${state.deleteCount}-${state.updateCount}`],  
    queryFn: async () => {
          setIsLoading(true);
          const data = await callApi2<Order[]>(
              `filter/type/${state.OrderTypeSelection}/${page}`, 
              "get", 
              "dev", 
              {
                  pageNumber: page,
                  type: state.OrderTypeSelection 
              }
          );
          setIsLoading(false);
          return data as AxiosResponse<Order[]>;
      },
      retry: MAX_ATTEMPTS,
      retryDelay: 1000,
      staleTime: FIVE_MINUTES,
  });

  // console.log(
  //   "query key: ", `get-specific-type-${state.OrderTypeSelection}-orders-${page}-${state.createCount}-${state.deleteCount}`,
  //   "data:", data
  // );

  return (<>
        {data?.data?.map((row, rowIndex) => {
          return <CustomTableRow 
                    rowId={rowIndex}
                    row={row}
                    selectOrder={selectOrder}
                    users={users}
                    customers={customers}
                  />
        })}
  </>)
}


function CustomerSearchResults({ page = 0, setIsLoading, users, customers }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { dispatch, setToastOpen } = useApiResponse();
  const { data } = useQuery2([page, state.createCount, state.deleteCount,state.CustomerSelection, state.updateCount],{  
    queryFn: async () => callApi2<Order[]>(
      `filter/customer/${state.CustomerSelection}/${page}`, 
      "get", 
      "dev", 
      {
          pageNumber: page,
          customer: state.CustomerSelection 
      }
    ),

    retry: 0,
    staleTime: FIVE_MINUTES,
    onError: (error: AxiosError<Order[]>) => {
      dispatch({
        message: error.message,
        status: error.status,
        isError: true
      });
      setToastOpen(true);
      setIsLoading(false);
    },
    onSettled: (
      response: AxiosResponse<Order[], any> | undefined, 
      error: AxiosError<Order[], any> | null
    ) => {

      // Throw an error on the server to trigger err state
      setIsLoading(false);
      dispatch({
        message: `Showing results for: ${state.CustomerSelection}`,
        status: 200,
        isError: false
      });
      setToastOpen(true);
    }
  });

  return (<>
        {data?.data?.map((row, rowIndex) => {
          return <CustomTableRow 
                    rowId={rowIndex}
                    row={row}
                    selectOrder={selectOrder}
                    users={users}
                    customers={customers}
                  />
        })}
  </>)
}


function AllOrderResults({ page = 0, setIsLoading, users, customers }: OrderTableRowProps) {

  const { state, selectOrder } = useTable()
  const { data } = useQuery({
    queryKey: [`get-all-orders-${page}-${state.createCount}-${state.deleteCount}`, state.createCount, state.updateCount],  
    queryFn: async () => {
          setIsLoading(true);
          const data = await callApi2<Order[]>(
              `Orders/${page}`, 
              "get", 
              "dev", 
              {
                  pageNumber: page
              }
          );

          setIsLoading(false);
          return data as AxiosResponse<Order[]>;
      },
      retry: MAX_ATTEMPTS,
      retryDelay: 1000,
      staleTime: FIVE_MINUTES
  });

  return (<>
      {data?.data?.map((row, rowIndex) => {
        return <CustomTableRow 
          rowId={rowIndex}
          row={row}
          selectOrder={selectOrder}
          users={users}
          customers={customers}
        />
      })}
  </>)
}

function TableLoading() {
  
  const ids = [1,2,3,4,5]
  return (<>
    {
      ids.map(rowId => (<>
          <TableRow key={rowId}>  
            <TableCell>
              <Checkbox />
            </TableCell>

            {
              ids.map(colId => (<>
                <TableCell key={(10 * rowId) + colId}>
                  <Box width={"100%"} height={"100%"}>
                    <Skeleton variant="rounded" />
                  </Box>
                </TableCell>
              </>))
            }
          </TableRow>
      </>))
    }
  </>)
}

function DatabaseConnectionError({ 
  connectionFailed = false,
  failureCount = 0, 
  maxFailureCount = 0, 
  allRetriesExhaused = false,
}) {

  const [ modalOpen, setModalOpen ] = useState<boolean>(true);
  const [ spinnerVisible, setSpinnerVisible ] = useState<boolean>(true);
  const modalTimeout = 800;
  const [ spinnerTimeout, setSpinnerTimeout ] = useState<number>(1200);


  const closeSpinner = (node: HTMLElement) => {
    new Promise((resolve, reject) => {
      setSpinnerTimeout(200);
      setTimeout(() => {
        resolve(setSpinnerVisible(false))
        console.log("closing spinner")
      }, spinnerTimeout)
    })
  }

  return (<>
    <Modal
      open={connectionFailed && modalOpen}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "none"
      }}
      >
      <Box
        sx={{
          width: "400px",
          border: "none"
        }}
        >
        <Paper
          elevation={24}
          sx={{
            width: "100%",
            padding: "1rem",
            border: "none"
          }}
        >
          <Stack
            spacing={3}
          >
            {
              connectionFailed?
                <Fade
                  key={1}
                  in={true}
                  timeout={modalTimeout}
                >
                  <Box>
                    <Stack spacing={3}>
                      <Alert 
                        variant="filled" 
                        severity="error"
                      >
                        Unable to connect to database.
                      </Alert>
                      <Typography variant="subtitle1" textAlign="center">
                        Reconnecting, attempt: <span style={{ color: "#D32F2F" }}>{failureCount}</span> / <span>{maxFailureCount}</span>
                      </Typography>
                      
                      {
                        spinnerVisible?
                          <Grow
                            in={failureCount < maxFailureCount}
                            onExiting={closeSpinner}
                            timeout={spinnerTimeout}
                          >
                            <Box
                              display={"flex"}
                              justifyContent={"center"}
                              alignContent={"center"}
                              paddingBottom={
                                failureCount < maxFailureCount ?
                                  "1rem":
                                  "none"
                              }
                            >
                              <CircularProgress color="error" />
                            </Box>
                          </Grow>
                        :
                        <></>
                      }

                    </Stack>
                  </Box>
                </Fade>
                :
                <Fade
                  key={2}
                  in={true}
                  timeout={modalTimeout}
                >
                  <Box>
                    <Stack spacing={3}>
                      <Alert 
                        variant="filled" 
                        severity="success"
                      >
                        Connection Established.
                      </Alert>
                      <Typography variant="subtitle1" textAlign="center">
                        You may close this modal.
                      </Typography>
                    </Stack>
                  </Box>
                </Fade>
            }
          </Stack>
          <Divider />

          <Box
            display={"flex"}
            alignContent={"end"}
            justifyContent={"end"}
            paddingTop={"1rem"}
          >
            <Button
              color={!connectionFailed? "success": "error"}
              variant="contained"
              disabled={connectionFailed && !allRetriesExhaused}
              onClick={event => setModalOpen(false)}
            >
              close
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  </>)
}

interface PaginationState {
  isError: boolean
}

export default function OrderTable() {

    
    const [ isLoading, setIsLoading ] = useState(false);
    const [ paginationState, setPaginationState ] = useState<PaginationState>({
      isError: false
    });

    const { state, dispatch } = useTable();
    let data = null;
    let criteria: PaginationCriteria = 0 as All;

    const paginationQuery = useQuery2([state.CustomerSelection, state.mode, state.OrderTypeSelection, state.createCount, state.deleteCount],
      {
        queryFn: async () => {
          return await callApi2<number>(
            `Orders/count?criteria=${criteria}&customerName=${state.CustomerSelection}&type=${state.OrderTypeSelection}`,
            "get",
            "dev",
            {
              criteria: criteria,
              customerName: state.CustomerSelection,
              type: state.OrderTypeSelection
            } 
          );
        },
        retryDelay: 3000,
        retry: MAX_ATTEMPTS - 1,
        staleTime: FIVE_MINUTES,
        onError: () => setPaginationState(prevState => ({ ...prevState, isError: true })),
        onSuccess: () => setPaginationState(prevState => ({ ...prevState, isError: false }))
      }
    );

    const usersQuery = useQuery2(["users", state.CustomerSelection, state.mode, state.OrderTypeSelection, state.createCount, state.deleteCount],
      {
        queryFn: async () => {
          const users = await callApi2<User[]>(
            "User",
            "get",
            "dev" 
          );

          return users?.data?.map(user => user.username);
        },
        retryDelay: 3000,
        retry: MAX_ATTEMPTS - 1,
        staleTime: FIVE_MINUTES,
        onError: () => setPaginationState(prevState => ({ ...prevState, isError: true })),
        onSuccess: () => setPaginationState(prevState => ({ ...prevState, isError: false }))
      }
    );

    const customersQuery = useQuery2(["customers", state.CustomerSelection, state.mode, state.OrderTypeSelection, state.createCount, state.deleteCount],
      {
        queryFn: async () => {
          const customers = await callApi2<Customer[]>(
            "Customer",
            "get",
            "dev" 
          );
          return customers?.data?.map(customer => customer.name);
        },
        retryDelay: 3000,
        retry: MAX_ATTEMPTS - 1,
        staleTime: FIVE_MINUTES,
        onError: () => setPaginationState(prevState => ({ ...prevState, isError: true })),
        onSuccess: () => setPaginationState(prevState => ({ ...prevState, isError: false }))
      }
    );


    if (state.mode == "All-Orders") {
      data = <AllOrderResults 
                  page={state.page} 
                  setIsLoading={setIsLoading} 
                  users={usersQuery?.data ?? [""]} 
                  customers={customersQuery?.data ?? [""]} 
              />
    }
    
    else if (state.mode == "Specific-Type") {
      criteria = 1 as Type;
      data = <SpecificTypeResults 
                  page={state.page} 
                  setIsLoading={setIsLoading} 
                  users={usersQuery?.data ?? [""]} 
                  customers={customersQuery?.data ?? [""]}  
              />
    }

    else if (state.mode == "Specific-Customer") {
      criteria = 2 as CustomerType;
      data = <CustomerSearchResults
                  page={state.page} 
                  setIsLoading={setIsLoading} 
                  users={usersQuery?.data ?? [""]}  
                  customers={customersQuery?.data ?? [""]} 
              />
    }


    const queryTypeAndCustomer: boolean = (
      state.CustomerSelection !== "" &&
      state.OrderTypeSelection !== ""
    );

    if (queryTypeAndCustomer) {
      criteria = 3 as CustomerAndType;
      data = <SpecificTypeAndCustomerResults 
                  page={state.page} 
                  setIsLoading={setIsLoading} 
                  users={usersQuery?.data ?? [""]} 
                  customers={customersQuery?.data ?? [""]} 
              />
    }

  const dbErrorComponent = <>
    <DatabaseConnectionError
        connectionFailed={paginationQuery.failureCount > 0 } 
        failureCount={paginationQuery.failureCount}
        maxFailureCount={MAX_ATTEMPTS}
        allRetriesExhaused={paginationQuery.failureCount === MAX_ATTEMPTS}/>
  </>
    console.log(`err state: err${paginationQuery.isError} lErr: ${paginationQuery.isLoadingError} fErr: ${paginationQuery.isRefetchError} => count: ${paginationQuery.failureCount}`, 
      (paginationQuery.error as AxiosError<number>)?.response?.data,
      paginationQuery?.data?.data,
      paginationQuery.isRefetchError
    );
    return (
      <>
        <TableContainer style={{
          height: "550px", 
          width: '100%'
        }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">
                            <Checkbox></Checkbox>
                        </TableCell>
                        {cellMap.map((cell) => (
                            <TableCell className="cell" key={cell.label} align="center">{cell.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                <TableBody>
                  {
                    
                      paginationQuery.failureCount > 0 ?
                      dbErrorComponent
                      :
                      isLoading? 
                        <TableLoading /> 
                        :
                          data
                  }
                </TableBody>
            </Table>
        </TableContainer>
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignContent={"center"}
          paddingTop={"1rem"}
        >
          {/* <ThemeProvider theme={PaginationTheme}> */}
            <Pagination 
              count={paginationQuery?.data?.data}
              color="primary"
              renderItem={item => <PaginationItem 
                                      {...item} 
                                      selected={item.page === state.page} 
                                    />
                          }
              onChange={(event, pageNumber) => dispatch(prevState => ({
                ...prevState, 
                page: pageNumber
              }))} 
            />
          {/* </ThemeProvider> */}
        </Box>
      </>
    );
}

