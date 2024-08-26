import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderClassification } from "../api/OrderHandler"

export type TableMode = "All-Orders" | "Specific-Customer" | "Specific-Type";
export interface TableState {
    mode: TableMode,
    OrderTypeSelection: OrderClassification | "",
    CustomerSelection: string,
    selectedOrders: string[],
    createCount: number,
    deleteCount: number
}

const initialState: TableState = {
    mode: "All-Orders",
    OrderTypeSelection: "",
    CustomerSelection: "",
    selectedOrders: [],
    createCount: 0,
    deleteCount: 0
}

export const tableSlice = createSlice({
    name: "table",
    initialState,
    reducers: {
        setMode: (state, action: PayloadAction<TableMode>) => {
            if (
                action.payload === "All-Orders" &&
                state.selectedOrders.length === 0 && 
                state.OrderTypeSelection === ""
            ) {
                state.mode = "All-Orders";
            }

            else {
                state.mode = action.payload;
            }
        },

        markForDeletion: (state, action: PayloadAction<string>) => {
            state.selectedOrders.push(action.payload);
        },

        unmarkForDeletion: (state, action: PayloadAction<string>) => {
            state.selectedOrders = state.
                                        selectedOrders
                                        .filter(x => x != action.payload);
        },

        clearSelectedOrders: state => {
            state.selectedOrders = [];
        }
    }
});

export const { setMode, markForDeletion } = tableSlice.actions;
export default tableSlice.reducer;
