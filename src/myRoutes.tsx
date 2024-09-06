import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Analytics } from "./Analytics";
import { Drafts } from "./Drafts";
import { Root } from "./Root";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root>
                    <App />
                </Root>
    },
    {
        path: "/drafts",
        element: <Root>
                    <Drafts />
                </Root>
    },
    {
        path: "/analytics",
        element: <Analytics />
    },
])