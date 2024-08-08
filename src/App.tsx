import React from 'react';
import "./App.css"
import { Navbar } from './Navbar';
import { SearchFilter } from './SearchFilter';
import { Box } from '@mui/material';

function App() {
  return (
    <Box>
      <Navbar />
      <SearchFilter />
    </Box>
  );
}

export default App;
