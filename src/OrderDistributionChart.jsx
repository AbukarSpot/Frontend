import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "./components/ui/chart"
import { Box, Paper } from "@mui/material"
import { useState } from "react"
import { DatePickerWithRange } from "./DateRange"


export const description = "A pie chart with a label"
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}

export function OrderDistributionChart() {
  
  const SEVEN_DAYS = 7 * (24 * 60 * 60 * 1000);
  const [date, setDate] = useState({
      from: new Date( ( new Date() ).getTime() - SEVEN_DAYS ),
      to: new Date( ( new Date() ).getTime() ),
  });

  const formatDate = dateValues => {
    let startDate = new Date(dateValues?.from);
    let endDate = new Date(dateValues?.to);
    const formatOptions = {
      month: "short",
      day: "numeric"
    }
    
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`
  }

  const getDate = data => {
    setDate(data);
  }

  return (
    <Paper
        elevation={4}
    >
        <Card>
        <CardHeader>
            <CardTitle>Order Distribution Chart</CardTitle>
            <Box>
              <Box
                  display={"flex"}
                  alignContent={"start"}
                  justifyContent={"start"}
              >
                  <CardDescription>{`${formatDate(date)}`}</CardDescription>
              </Box>

              <Box
                  display={"flex"}
                  alignContent={"end"}
                  justifyContent={"end"}
                  gap={"1rem"}
              >
                  <DatePickerWithRange GetData={getDate}/>
              </Box>
            </Box>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
            >
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
            </PieChart>
            <ChartLegend content={<ChartLegendContent />} />
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
            </div>
        </CardFooter>
        </Card>
    </Paper>
  )
}