import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Analytics } from "./Analytics";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/drafts",
        element: <App />
    },
    {
        path: "/analytics",
        element: <Analytics />
    },
])