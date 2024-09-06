import "./App.css"
import { SearchFilter } from './SearchFilter';
import { Box } from '@mui/material';
import OrderTable from './OrderTable';

export function App() {
  return (
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
  );
}

export default App;
