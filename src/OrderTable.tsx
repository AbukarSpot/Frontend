import { Box, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Order } from "./api/OrderHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callApi2 } from "./api";
import { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useTable } from "./api/contexts";

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
interface OrderTableProps {
    mutation: OrderMutationFunction,
    changePage: React.Dispatch<React.SetStateAction<number>>,
    page: number
} 

function SpecificTypeAndCustomerResults({ page = 0 }) {
  
  const { state } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-customer-type-${state.OrderTypeSelection}-${state.CustomerSelection}-orders-${page}`],  
    queryFn: async () => {
          const data = await callApi2<Order[]>(
              `filter/type/customer/${state.OrderTypeSelection}/${state.CustomerSelection}`, 
              "get", 
              "prod", 
              {
                  pageNumber: page,
                  customer: state.CustomerSelection,
                  type: state.OrderTypeSelection
              }
          );
          return data as AxiosResponse<Order[]>;
      },
      retry: MAX_ATTEMPTS,
      retryDelay: 1000,
      staleTime: FIVE_MINUTES
  });

  console.log("get-specific-customer-type", data, state);
  return (<>
        {data?.data?.map((row, rowIndex) => {
          return <TableRow key={rowIndex}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
        })}
  </>)
}

function SpecificTypeResults({ page = 0 }) {
  
  const { state, dispatch } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-type-${state.OrderTypeSelection}-orders-${page}`],  
    queryFn: async () => {
          const data = await callApi2<Order[]>(
              `filter/type/${state.OrderTypeSelection}`, 
              "get", 
              "prod", 
              {
                  pageNumber: page,
                  type: state.OrderTypeSelection 
              }
          );
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
                      <Checkbox />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
        })}
  </>)
}


function CustomerSearchResults({ page = 0 }) {
  
  const { state } = useTable();
  const { data } = useQuery({
    queryKey: [`get-specific-customer-${state.CustomerSelection}-orders-${page}`],  
    queryFn: async () => {
          const data = await callApi2<Order[]>(
              `filter/customer/${state.CustomerSelection}`, 
              "get", 
              "prod", 
              {
                  pageNumber: page,
                  customer: state.CustomerSelection 
              }
          );
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
                      <Checkbox />
                    </TableCell>
                    {
                       cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                    }
                  </TableRow>
        })}
  </>)
}

function AllOrderResults({ page = 0 }) {

  const { data } = useQuery({
    queryKey: [`get-all-orders-${page}`],  
    queryFn: async () => {
          const data = await callApi2<Order[]>(
              "Orders", 
              "get", 
              "prod", 
              {
                  pageNumber: page
              }
          );
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
                    <Checkbox />
                  </TableCell>
                  {
                      cellMap.map((cell, cellIndex) => (<TableCell key={(rowIndex * 10) + cellIndex}>{row[cell.objectKey]}</TableCell>))
                  }
                </TableRow>
      })}
  </>)
}


export default function OrderTable() {

    
    const [ page, setPage ] = useState(0);
    const { state } = useTable();
    let data = null;

    if (state.mode == "All-Orders") {
      data = <AllOrderResults page={page} />
    }

    else if (state.mode == "Specific-Customer") {
      data = <CustomerSearchResults page={page} />
    }

    else if (state.mode == "Specific-Type") {
      data = <SpecificTypeResults page={page} />
    }

    const queryTypeAndCustomer: boolean = (
      state.CustomerSelection !== "" &&
      state.OrderTypeSelection !== ""
    );

    if (queryTypeAndCustomer) {
      data = <SpecificTypeAndCustomerResults page={page} />
    }

    return (
        <TableContainer style={{ height: 500, width: '100%' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Checkbox></Checkbox>
                        </TableCell>
                        {cellMap.map((cell) => (
                            <TableCell className="cell" key={cell.label} align='left'>{cell.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                <TableBody>
                  { data }
                </TableBody>
            </Table>
        </TableContainer>
    );
}