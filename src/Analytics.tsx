import { Box, Container } from "@mui/material";
import { OrderFrequencyChart } from "./OrdersFrequencyGraph";
import { OrderDistributionChart } from "./OrderDistributionChart";


export function Analytics() {

    return (<>
        <Container>
            <Box
                paddingTop={"2rem"}
                paddingBottom={"5rem"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignContent={"center"}
                gap={2}
            >
                <OrderFrequencyChart />
                <OrderDistributionChart />
            </Box>
        </Container>
    </>)
}