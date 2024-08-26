
import { useQuery } from "@tanstack/react-query";
const BASE_URL = process.env.REACT_APP_BACKEND_ROUTE;

export type OrderClassification = "Standard" | "SaleOrder" | "PurchaseOrder" | "TransferOrder"| "ReturnOrder"; 

export type Order = {
    id: string,
    date: string,
    by: string,
    type: OrderClassification,
    customer: string
};

export type OrderRequest = {
    Type: OrderClassification,
    CustomerName: string,
    Username: string,
}

export class OrderHandler {

    static getOrders(data: Order) {
        return useQuery({
            queryKey: ["my-orders"],
            queryFn: () => OrderHandler.callApi<Order[]>("Orders"),
            refetchOnWindowFocus: true,
            staleTime: 1000 * 60 * 5,
        })
    }

    static async callApi<T = any>(route: string, method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get') {
        const result = await fetch(`${BASE_URL}${route}`, {
            method: method,
            headers: new Headers({ 
                'content-type': "application/json"
            })
        })
        const parsed = await result.json();
        return parsed as T;
    };
}