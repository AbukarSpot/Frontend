
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiResponseContextProvider, TableContextProvider } from "./api/contexts";
import { 
    QueryClient as QueryClient2, 
    QueryClientProvider as QueryClientProvider2
} from "react-query"

interface RootProps {
    children: React.ReactNode
}

const client = new QueryClient();
const client2 = new QueryClient2();
export function Root({ children }: RootProps) {

    return <>
        <TableContextProvider>
            <ApiResponseContextProvider>
                <QueryClientProvider client={client}>
                    <QueryClientProvider2 client={client2}>
                        {children}
                    </QueryClientProvider2>
                </QueryClientProvider>
            </ApiResponseContextProvider>
        </TableContextProvider>
    </>
}