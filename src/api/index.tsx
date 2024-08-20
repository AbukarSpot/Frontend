import { useQuery } from "@tanstack/react-query";
import React from "react"
type Order = { id: string; customerName: string };
const PROD_BASE_URL = process.env.REACT_APP_BACKEND_ROUTE;

export async function callApi<T = any>(
    route: string, 
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    env: 'dev' | 'prod' = 'prod'
) {
    let base_url = ( env === 'dev')? 
                    "http://localhost:5150/":
                    PROD_BASE_URL;

    const result = await fetch(`${base_url}${route}`, {
        method: method,
        mode: "cors",
        headers: new Headers({
            'content-type': "application/json"
        })
    })

    const parsed = await result.json();
    return parsed as T;
};

function useOrders() {
    return useQuery({
        queryKey: ["my-orders"],
        queryFn: () => callApi<Order[]>("getOrders"),
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 5,
    })
}

const MyComponent = () => {
    const { data: orders, ...queryData } = useOrders();
    return <>
        <pre>{JSON.stringify(queryData)}</pre>
        {orders?.map(o => <span key={o.id}>{o.customerName}: {o.id}</span>)}
    </>
}