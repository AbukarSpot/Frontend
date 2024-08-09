import React from 'react';
import "./App.css"
import { Navbar } from './Navbar';
import { SearchFilter } from './SearchFilter';
import { Box } from '@mui/material';

function App() {
  return (
    <>
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
      </Box>
    </>
  );
}

export default App;
