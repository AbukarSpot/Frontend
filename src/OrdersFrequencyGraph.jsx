

import { Area, AreaChart, Bar, BarChart, LabelList, CartesianGrid, XAxis, YAxis } from "recharts"



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
import { Box, Button, Paper } from "@mui/material"
import { DatePickerWithRange } from "./DateRange"
import { useCallback, useMemo, useState } from "react"
import { useQuery } from "react-query"
import { callApi2 } from "./api"

const chartConfig = {
    orderCount: {
        label: "Order Count",
        color: "#990000",
    },
    logoffCount: {
        label: "Logoff",
        color: "#59264d",
    },
}

function OrdersFrequencyGraph({ Data }) {
    return (<>
    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={Data}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-loginCount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-loginCount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              
              <linearGradient id="fillOrderCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-orderCount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-orderCount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dateOf"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
              <Area
                dataKey="orderCount"
                type="natural"
                fill="url(#fillOrderCount)"
                stroke="var(--color-orderCount)"
                stackId="a"
              />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </>)
}

function OrderFrequencyBarChart({ Data }) {
    return (<>
      <CardContent>
          <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={Data}>
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="dateOf"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                  }}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
                
              />
              <Bar dataKey="orderCount" fill="var(--color-orderCount)" radius={4}>
                  <LabelList
                      position="top"
                      offset={6}
                      className="fill-foreground"
                      fontSize={12}
                  />
              </Bar>
          <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
          </ChartContainer>
        </CardContent>
    </>)
}

export function OrderFrequencyChart() {

    const SEVEN_DAYS = 7 * (24 * 60 * 60 * 1000);
    const [date, setDate] = useState({
        from: new Date( ( new Date() ).getTime() - SEVEN_DAYS ),
        to: new Date( ( new Date() ).getTime() ),
    });
    
    // react query
    const orderFreqQuery = useQuery([date?.from, date?.to], {
      queryFn: async () => {
        const dateFormat = {
          month: "numeric", 
          day: "numeric", 
          year: "numeric" 
        }

        const startDate = new Date(date?.from)
                        ?.toLocaleDateString('en-US', dateFormat);
      
        const endDate = new Date(date?.to)
                          ?.toLocaleDateString('en-US', dateFormat);
        
        const invalidDateProvided = startDate === "Invalid Date" ||
                                    endDate === "Invalid Date"
        if (invalidDateProvided) {
          throw new Error("You provided an invalid date.");
        }

        return callApi2(
          "Orders/analytics/frequency",
          "post",
          "dev",
          {
            startDate: startDate,
            stopDate: endDate
          }
        );
      }
    });
    
    
    
    const getDate = data => {
      setDate(data);
    }
      
    const formatDate = dateValues => {
      let startDate = new Date(dateValues?.from);
      let endDate = new Date(dateValues?.to);
      const formatOptions = {
        month: "short",
        day: "numeric"
      }
      
      return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`
    }
    
    const ONE_DAY_IN_MILISECONDS = 1000 * 60 * 60 * 24;
    const ELLAPSED_TIME = Math.abs(date?.to - date?.from);
    const dateRange = Math.floor( ELLAPSED_TIME / ONE_DAY_IN_MILISECONDS );
    const dateRangeGreaterThanHalfMonth = dateRange > 15;

    return (
        <Paper 
          elevation={4}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Order Frequency Chart</CardTitle>
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
                        <Box
                            display={"flex"}
                            alignContent={"end"}
                            justifyContent={"end"}
                        >
                        </Box>
                    </Box>
                </CardHeader>

                    {
                      dateRangeGreaterThanHalfMonth? 
                        <OrdersFrequencyGraph Data={orderFreqQuery?.data?.data} />
                      :
                        <OrderFrequencyBarChart Data={orderFreqQuery?.data?.data} />
                    }
                
                {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                    </div>
                </CardFooter> */}
            </Card>
        </Paper>
    )
}