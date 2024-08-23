import { TableState } from "../redux/tableReducer";
import { createContext, useContext, useState } from "react";

const initialTableState: TableState = {
    mode: "All-Orders",
    OrderTypeSelection: "",
    CustomerSelection: "",
    selectedOrders: []
}

type TableContextType = { state: TableState, dispatch: React.Dispatch<React.SetStateAction<TableState>> };
const TableContext = createContext<TableContextType>(null as any);

export const TableContextProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, dispatch] = useState(initialTableState)
    return <TableContext.Provider value={
        { state, dispatch }
    }>{props.children}</TableContext.Provider>
}

export function useTable() {
    const ctxValue = useContext<TableContextType>(TableContext)
    if (!ctxValue) {
        throw new Error("useTable must be called from inside a TableContextProvider")
    }

    return ctxValue;
}