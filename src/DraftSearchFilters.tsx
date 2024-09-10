import { Box, Button, ThemeProvider } from "@mui/material";
import { ButtonTheme } from "./Themes";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useApiResponse, useDraft } from "./api/contexts";
import { OrderDraft } from "./Drafts";
import { useMutation } from "react-query";
import { callApi2 } from "./api";
import { OrderRequest } from "./api/OrderHandler";


export function DraftSearchFilters() {

    const [ orderDrafts, setOrderDrafts ] = useLocalStorage<Record<string, OrderDraft>>("Orders")
    const { dispatch: dispatchApiResponse, setToastOpen } = useApiResponse();
    const { state, dispatch } = useDraft();
    
    // create endpoint to create multiple orders at once
    const createOrdersMutation = useMutation({
        mutationFn: (orders: Record<string, string>[]) => {
            return callApi2<boolean>(
                "Orders/bulk",
                "post",
                "dev",
                {
                    Orders: orders
                }
            )
        },
    })
    
    const deleteDrafts = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        
        console.log("delete set b4 =>", state.delete.size)
        state.delete.forEach(orderDraft => {
            delete orderDrafts[orderDraft.date];
        })
        console.log("delete set after =>", state.delete.size)
        setOrderDrafts(orderDrafts);
    } 

    const createDrafts = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const payload = Array
                        .from(state.create)
                        .map(orderReq => ({
                            type: orderReq.Type,
                            customerName: orderReq.CustomerName,
                            username: orderReq.Username,
                        }))

        console.log("payload: ", payload);
        createOrdersMutation
                        .mutate(
                            payload, 
                            {
                                onSuccess: () => dispatch(prevState => {
                                    let apiResponse = {
                                        message: "Successfully created draft.",
                                        status: 200,
                                        isError: false
                                    };

                                    if (prevState.create.size > 1) {
                                        apiResponse = {
                                            ...apiResponse,
                                            message: "Successfully created drafts."
                                        };
                                    }

                                    
                                    dispatchApiResponse(apiResponse);
                                    state.create.forEach(orderDraft => {
                                        delete orderDrafts[orderDraft.date];
                                    });
                                    setOrderDrafts(orderDrafts);
                                    prevState.create.clear();
                                    setToastOpen(true);
                                    return { ...prevState }
                                })
                            }
                        );
    }

    return (<>
        <Box
            display={"flex"}
            justifyContent={"start"}
            alignContent={"start"}
            gap={2}
            padding={"1rem"}
        >
            <ThemeProvider theme={ButtonTheme}>
                <Button
                    onClick={deleteDrafts}
                >
                    Delete Draft
                </Button>
                
                <Button
                    onClick={createDrafts}
                >
                    Create Draft
                </Button>
            </ThemeProvider>
        </Box>
    </>)
}