import "./App.css"
import { Navbar } from './Navbar';
import { SearchFilter } from './SearchFilter';
import { Box } from '@mui/material';
import OrderTable, { OrderMutationFunction } from './OrderTable';

import { useState } from "react";
import { ApiResponseContextProvider, TableContextProvider } from "./api/contexts";

function App() {
  
  const [ mode, setMode ] = useState<string>("All");
  return (
    <TableContextProvider>
      <ApiResponseContextProvider>
        <Navbar />
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignContent={"center"}
          gap={"1rem"}
          padding={"1rem 1rem 0 1rem"}
        >
          <SearchFilter />
          <OrderTable />
        </Box>
      </ApiResponseContextProvider>
    </TableContextProvider>
  );
}

export default App;
