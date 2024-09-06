import { stat } from "fs";
import { createContext, useContext, useState } from "react";
import { OrderClassification } from "./OrderHandler";
import { OrderDraft } from "../Drafts";

export type TableMode = "All-Orders" | "Specific-Customer" | "Specific-Type";
export interface TableState {
    mode: TableMode,
    OrderTypeSelection: OrderClassification | "",
    CustomerSelection: string,
    selectedOrders: string[],
    createCount: number,
    deleteCount: number,
    updateCount: number,
    page: number,
}


type TableContextType = { 
    state: TableState, 
    dispatch: React.Dispatch<React.SetStateAction<TableState>>,
    selectOrder: (orderId: string, action: "push" | "pop") => void
};

const initialTableState: TableState = {
    mode: "All-Orders",
    OrderTypeSelection: "",
    CustomerSelection: "",
    selectedOrders: [],
    createCount: 0,
    deleteCount: 0,
    updateCount: 0,
    page: 1
}
const TableContext = createContext<TableContextType>(null as any);

export const TableContextProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, dispatch] = useState(initialTableState)
    const [responseState, dispatchResponseData] = useState(initialTableState)
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



// API response context
interface ApiResponse {
    message: string | null,
    status: string | number | null | undefined,
    isError: boolean
}

type ApiResponseContextType = {
    state: ApiResponse,
    toastOpen: boolean, 
    dispatch: React.Dispatch<React.SetStateAction<ApiResponse>>,
    setToastOpen: React.Dispatch<React.SetStateAction<boolean>>
};

const initialApiResponseState: ApiResponse = {
    message: null,
    status: null,
    isError: false
}

const ApiResponseContext = createContext<ApiResponseContextType>(null as any);
export const ApiResponseContextProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, dispatch] = useState(initialApiResponseState)
    const [toastOpen, setToastOpen] = useState<boolean>(false);
    return <ApiResponseContext.Provider value={
        { state, dispatch, toastOpen, setToastOpen }
    }>{props.children}</ApiResponseContext.Provider>
}

export function useApiResponse() {
    const ctxValue = useContext<ApiResponseContextType>(ApiResponseContext)
    if (!ctxValue) {
        throw new Error("useApiResponse must be called from inside a ApiResponseContextProvider")
    }

    return ctxValue;
}


// Drafts context
interface DraftContext {
    delete: Set<OrderDraft>,
    create: Set<OrderDraft>,
}

type DraftContextType = {
    state: DraftContext,
    dispatch: React.Dispatch<React.SetStateAction<DraftContext>>,
};

const initialDraftState: DraftContext = {
    delete: new Set<OrderDraft>([]),
    create: new Set<OrderDraft>([])
}

const DraftContext = createContext<DraftContextType>(null as any);
export const DraftContextProvider = (props: React.PropsWithChildren<{}>) => {
    const [state, dispatch] = useState(initialDraftState)
    return <DraftContext.Provider value={
        { state, dispatch }
    }>{props.children}</DraftContext.Provider>
}

export function useDraft() {
    const ctxValue = useContext<DraftContextType>(DraftContext)
    if (!ctxValue) {
        throw new Error("useDraft must be called from inside a DraftContextProvider")
    }

    return ctxValue;
}