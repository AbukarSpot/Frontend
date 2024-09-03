import { Alert, Autocomplete, Box, Button, Checkbox, Divider, Fade, Modal, Pagination, PaginationItem, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography } from "@mui/material";
import { Order } from "./api/OrderHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callApi2 } from "./api";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useApiResponse, useTable } from "./api/contexts";
import { isError, useQuery  as useQuery2 } from "react-query";
import { All, Customer, CustomerAndType, PaginationCriteria, Type } from "./pagination";

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
    page: number
} 

interface OrderPaginationRequest {
  criteria: PaginationCriteria,
  customerName: string | null,
  type: string | null
}

interface CustomTableCheckBoxProps {
  orderId: string,
  selectOrder: (orderId: string, action: "push" | "pop") => void
} 

interface CustomTableRowProps {
  row: Order,
  rowId: number,
  selectOrder: (orderId: string, action: "push" | "pop") => void
} 


interface CustomAutocompleteProps<T = any> {
  value: string,
  options: string[],
  colKey: string,
  getValue: React.Dispatch<React.SetStateAction<Order>>
} 

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

function CustomAutocomplete<T>({ value, options, colKey, getValue }: CustomAutocompleteProps<T>) {
  
  const [_value, setValue] = useState<string>(value);

  return <>
      <Autocomplete
        value={_value} 
        options={options} 
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
        
        onChange={(event, newInputValue) => {
          setValue(newInputValue);
          getValue(prevState => ({
            ...prevState,
            [colKey]: newInputValue
          }));
        }}
      />
  </>
}

// debounce here and store data in state
function CustomTableRow({ row, rowId, selectOrder }: CustomTableRowProps) {

  const [ order, setOrder ] = useState<Order>(row);
  const { state, dispatch, setToastOpen }= useApiResponse()
  const [ prevState, setPrevState ] = useState<Order>(row);
  useQuery2([order], {
    queryFn: () => {
      setToastOpen(false);
      return callApi2<void>(
        `Orders/${order.id}`,
        "patch",
        "dev",
        {
          orderId: order.id,
          createdDate: order.date,
          username: order.by,
          orderType: order.type,
          customerName: order.customer
        }
      )
    },
    onSuccess: () => {
      console.log("success hit");
      dispatch({
        message: `Updated order: ${order.id}`,
        status: 200,
        isError: false
      });
      setToastOpen(true);
      setPrevState(order);
    },

    onError: (error: AxiosError) => {
      console.log("errror hit");
      dispatch({
        message: `Unable to update ${order.id} at this time.`,
        status: error.code,
        isError: true
      });
      setToastOpen(true);
      setOrder(prevState);
    },
    staleTime: FIVE_MINUTES,
    cacheTime: 10000
  })

  return (<>
    <TableRow key={rowId}>
      <TableCell>
        <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
      </TableCell>

      <TableCell>
        {row["id"]}
      </TableCell>
      
      <TableCell>
        {row["date"]}
      </TableCell>

      {/* add data */}
      <TableCell>
        <CustomAutocomplete 
          value={row["by"]} 
          options={[ row["by"], "Ligba" ]}
          colKey="Username"
          getValue={setOrder} 
        />
      </TableCell>

      <TableCell>
        <CustomAutocomplete
          value={row["type"]} 
          options={[
            "Standard",
            "SaleOrder",
            "PurchaseOrder",
            "TransferOrder",
            "ReturnOrder"
          ]}
          colKey="OrderType"
          getValue={setOrder} 
        />
      </TableCell>

      <TableCell>
        <CustomAutocomplete
          value={row["customer"]} 
          options={[ row["customer"] ]} 
          colKey="CustomerName"
          getValue={setOrder}
        />
      </TableCell>
    </TableRow>
  </>);
}

function SpecificTypeAndCustomerResults({ page = 0, setIsLoading }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-customer-type-${state.OrderTypeSelection}-${state.CustomerSelection}-orders-${page}-${state.createCount}-${state.deleteCount}`],  
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
                  />
        })}
  </>)
}

function SpecificTypeResults({ page = 0, setIsLoading }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-type-${state.OrderTypeSelection}-orders-${page}-${state.createCount}-${state.deleteCount}`],  
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
                  />
        })}
  </>)
}


function CustomerSearchResults({ page = 0, setIsLoading }: OrderTableRowProps) {
  
  const { state, selectOrder } = useTable();
  const { dispatch, setToastOpen } = useApiResponse();
  const { data } = useQuery2([page, state.createCount, state.deleteCount,state.CustomerSelection],{  
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
                  />
        })}
  </>)
}


function AllOrderResults({ page = 0, setIsLoading }: OrderTableRowProps) {

  const { state, selectOrder } = useTable()
  const { data } = useQuery({
    queryKey: [`get-all-orders-${page}-${state.createCount}-${state.deleteCount}`, state.createCount],  
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
        />
      })}
  </>)
}

// return <TableRow key={rowIndex}>
//                   <TableCell>
//                     <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
//                   </TableCell>
//                   {
//                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
//                   }
//                 </TableRow>

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
  requestDelay = 0, 
  allRetriesExhaused = false,
  connectionEstablished = false
}) {

  const [ modalOpen, setModalOpen ] = useState<boolean>(true);
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
                  timeout={1200}
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
                        Reconnecting, attempt: <span style={{ color: "green" }}>{failureCount}</span> / <span>{maxFailureCount}</span>
                      </Typography>
                    </Stack>
                  </Box>
                </Fade>
                :
                <Fade
                  key={2}
                  in={true}
                  timeout={1200}
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

    if (state.mode == "All-Orders") {
      data = <AllOrderResults page={state.page} setIsLoading={setIsLoading} />
    }
    
    else if (state.mode == "Specific-Type") {
      criteria = 1 as Type;
      data = <SpecificTypeResults page={state.page} setIsLoading={setIsLoading} />
    }

    else if (state.mode == "Specific-Customer") {
      criteria = 2 as Customer;
      data = <CustomerSearchResults page={state.page} setIsLoading={setIsLoading} />
    }


    const queryTypeAndCustomer: boolean = (
      state.CustomerSelection !== "" &&
      state.OrderTypeSelection !== ""
    );

    if (queryTypeAndCustomer) {
      criteria = 3 as CustomerAndType;
      data = <SpecificTypeAndCustomerResults page={state.page} setIsLoading={setIsLoading} />
    }
    
    
  //   const paginationQuery = useQuery({
  //     queryKey: [state.CustomerSelection, state.mode, state.OrderTypeSelection, state.createCount, state.deleteCount],
  //     queryFn: async () => {
  //       return await callApi2<number>(
  //         `Orders/count?criteria=${criteria}&customerName=${state.CustomerSelection}&type=${state.OrderTypeSelection}`,
  //         "get",
  //         "dev",
  //         {
  //           criteria: criteria,
  //           customerName: state.CustomerSelection,
  //           type: state.OrderTypeSelection
  //         } 
  //       );
  //     },
  //     retryDelay: 3000,
  //     retry: MAX_ATTEMPTS - 1,
  //     staleTime: FIVE_MINUTES
  //   },
  // );

  
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

  // fix this component firing
  const dbErrorComponent = <>
    <DatabaseConnectionError
        connectionFailed={paginationState.isError || !paginationQuery.isFetched} 
        connectionEstablished={!paginationQuery.isFetching || !paginationQuery.isLoading}
        failureCount={paginationQuery.failureCount}
        requestDelay={3000}
        maxFailureCount={MAX_ATTEMPTS}
        allRetriesExhaused={paginationQuery.failureCount === MAX_ATTEMPTS}/>
  </>
    console.log(`err state: ${paginationQuery.isError}`, 
      (paginationQuery.error as AxiosError<number>)?.response?.data,
      paginationQuery?.data?.data,
      paginationQuery.isRefetchError
    );
    return (
      <>
        <TableContainer style={{
          height: "500px", 
          width: '100%'
        }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Checkbox></Checkbox>
                        </TableCell>
                        {cellMap.map((cell) => (
                            <TableCell className="cell" key={cell.label} align='center'>{cell.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                <TableBody>
                  {
                    paginationQuery.isError?
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

