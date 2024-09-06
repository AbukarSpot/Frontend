import { Box, Pagination, PaginationItem, Table, TableBody, TableCell, Checkbox, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import { DraftSearchFilters } from "./DraftSearchFilters";
import { DraftContextProvider, useDraft } from './api/contexts';

export interface OrderDraft {
    date: string,
    Username: string,
    Type: string,
    CustomerName: string,
}
const cellMap: {label: string, objectKey: keyof OrderDraft}[] = [
    { label: "Draft Date", objectKey: "date" },
    { label: "Drafted by", objectKey: "Username" },
    { label: "Order Type", objectKey: "Type" },
    { label: "Customer", objectKey: "CustomerName" },
];


function DraftEntry(props: OrderDraft) {

    const { state, dispatch } = useDraft();
    const [ isSelected, setIsSelected ] = useState<boolean>(false)
    const [ isChecked, setIsChecked ] = useState<boolean>(false)
    return (<>
        <TableRow
            selected={isSelected}
            onMouseOver={e => setIsSelected(true)}
            onMouseLeave={e => setIsSelected(false)}
            onClick={e => {
                console.log("set contains => ", state.create);
                if (state.create.has(props)) {
                    state.create.delete(props);
                } else {
                    state.create.add(props);
                }

                if (state.delete.has(props)) {
                    state.delete.delete(props);
                } else {
                    state.delete.add(props);
                }
                
                setIsChecked(prevState => !prevState)
            }}
        >  
            <TableCell align="center">
              <Checkbox checked={isChecked}/>
            </TableCell>

            <TableCell align="center" key={props.date}>{props.date}</TableCell>
            <TableCell align="center" key={props.Username}>{props.Username}</TableCell>
            <TableCell align="center" key={props.Type}>{props.Type}</TableCell>
            <TableCell align="center" key={props.CustomerName}>{props.CustomerName}</TableCell>
          </TableRow>
    </>)
}

export function Drafts() {

    const [ page, setPage ] = useState<number>(1);
    const [ drafts, setDrafts ] = useLocalStorage<Record<string, OrderDraft>>("Orders");
    const entriesPerPg = 5;
    const orders = Object.entries(drafts);
    const pages = Math.floor(orders.length / entriesPerPg) + 1;
    let data = orders
                    .map(keyValuePair => keyValuePair[1])
                    .map(orderDraft => <DraftEntry 
                                            date={orderDraft.date}
                                            Username={orderDraft.Username}
                                            Type={orderDraft.Type}
                                            CustomerName={orderDraft.CustomerName}
                                        />
                    )
                    .slice((page - 1), (page - 1) + entriesPerPg + 1);
    return (<>
    <>
        <DraftContextProvider>
                <DraftSearchFilters />
                <TableContainer style={{
                height: "550px", 
                width: '100%'
                }}>
                    <Table key={orders.length}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                    <Checkbox />
                                </TableCell>
                                {cellMap.map((cell) => (
                                    <TableCell className="cell" key={cell.label} align="center">{cell.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        
                        <TableBody>
                        {
                            
                            pages < 1?
                                <TableCell>No drafts present</TableCell>
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
                    <Pagination 
                    count={pages}
                    color="primary"
                    renderItem={item => <PaginationItem 
                                            {...item} 
                                            selected={item.page === page} 
                                            />
                                }
                    onChange={(event, pageNumber) => {
                        setPage(pageNumber);
                    }} 
                    />
                </Box>
        </DraftContextProvider>
      </>
    </>)
}