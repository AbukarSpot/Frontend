
import { useQuery } from "@tanstack/react-query";
import { callApi } from ".";
const BASE_URL = process.env.REACT_APP_BACKEND_ROUTE;

export type User = {
    userId: string,
    username: string
};

export type Customer = {
    customerId: string,
    name: string
};


export async function useGetUsers() {
    return await useQuery({
        queryKey: ["my-users"],
        queryFn: () => callApi<User[]>("Users/Alls"),
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 5,
    })
}