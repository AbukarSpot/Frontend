import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import React from "react"
type Order = { id: string; customerName: string };
const PROD_BASE_URL = process.env.REACT_APP_BACKEND_ROUTE;

export async function callApi<T = any>(
    route: string, 
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    env: 'dev' | 'prod' = 'prod',
    data: any | null = null 
) {
    let base_url = ( env === 'dev')? 
                    "http://localhost:5150/":
                    PROD_BASE_URL;

    let requestData = {
        method: method,
        mode: "cors",
        headers: new Headers({
            'content-type': "application/json"
        })
    } as RequestInit;

    if (data !== null) {
        requestData = { 
            ...requestData, 
            body: JSON.stringify(data)
        }
    }
    
    const result = await fetch(`${base_url}${route}`, requestData)
    const parsed = await result.json();
    return parsed as T;
};

export async function callApi2<T = any>(
    route: string, 
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
    env: 'dev' | 'prod' = 'prod',
    data: any | null = null ,
    params: any | null = null 
){
    let base_url = ( env === 'dev')? 
                    "http://localhost:5150/":
                    PROD_BASE_URL;

    try {
        let response = null;
        if (method === 'get') {
            response = await axios.get<T>(`${base_url}${route}`, {
                ...data,
                ...params
            });
        }
        else if (method === 'post') {
            response = await axios.post<T>(`${base_url}${route}`, {                
                ...data,
            });
        }
        else if (method === 'delete') {
            response = await axios.delete<T>(`${base_url}${route}`, {                
                data: data,
            });
        }
        else if (method === 'patch') {
            response = await axios.patch<T>(`${base_url}${route}`, {                
                data: data,
            });
        }

        return response as AxiosResponse<T>;
    } catch (error) {
        throw error as AxiosError<Order[]>;
    }

    
}
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