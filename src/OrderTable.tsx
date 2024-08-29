import { Box, Checkbox, Pagination, PaginationItem, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider } from "@mui/material";
import { Order } from "./api/OrderHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callApi2 } from "./api";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useApiResponse, useTable } from "./api/contexts";
import { useQuery  as useQuery2 } from "react-query";
import { All, Customer, CustomerAndType, PaginationCriteria, Type } from "./pagination";

const MAX_ATTEMPTS = 10;
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
          return <TableRow key={rowIndex}>
                    <TableCell>
                      <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
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
          return <TableRow key={rowIndex}>
                    <TableCell>
                      <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
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
          return <TableRow key={rowIndex}>
                    <TableCell>
                      <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
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
        return <TableRow key={rowIndex}>
                  <TableCell>
                    <CustomTableCheckBox orderId={row.id} selectOrder={selectOrder} />
                  </TableCell>
                  {
                      cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                  }
                </TableRow>
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


export default function OrderTable() {

    
    const [ isLoading, setIsLoading ] = useState(false);
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
    
    const paginationQuery = useQuery({
      queryKey: [state.CustomerSelection, state.mode, state.OrderTypeSelection, state.createCount, state.deleteCount],
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
      } 
    });

    console.log(`curr pg is: ${state.page}`);
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
                    isLoading? 
                      <TableLoading /> :
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