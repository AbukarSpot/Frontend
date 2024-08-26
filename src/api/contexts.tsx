import { stat } from "fs";
import { TableState } from "../redux/tableReducer";
import { createContext, useContext, useState } from "react";

const initialTableState: TableState = {
    mode: "All-Orders",
    OrderTypeSelection: "",
    CustomerSelection: "",
    selectedOrders: [],
    createCount: 0,
    deleteCount: 0
}

type TableContextType = { 
    state: TableState, 
    dispatch: React.Dispatch<React.SetStateAction<TableState>>,
    selectOrder: (orderId: string, action: "push" | "pop") => void
 };
const TableContext = createContext<TableContextType>(null as any);

export const TableContextProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, dispatch] = useState(initialTableState)
    const selectOrder = (orderId: string, action: "push" | "pop") => {
        if (action === "push") {
            if (!state.selectedOrders.includes(orderId)) {
                state.selectedOrders.push(orderId);
            }
        }
        else if (action === "pop") {
            let index = state.selectedOrders.indexOf(orderId);
            if (index < 0) {
                return;
            }
            state.selectedOrders = state.selectedOrders.slice(0, index)
                                    .concat(state.selectedOrders.slice(index + 1, state.selectedOrders.length));
        }
        dispatch(prevState => ({
            ...prevState,
            selectedOrders: state.selectedOrders
        }));
    }
    return <TableContext.Provider value={
        { state, dispatch, selectOrder }
    }>{props.children}</TableContext.Provider>
}

export function useTable() {
    const ctxValue = useContext<TableContextType>(TableContext)
    if (!ctxValue) {
        throw new Error("useTable must be called from inside a TableContextProvider")
    }

    return ctxValue;
}