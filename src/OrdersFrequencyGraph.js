

import { Area, AreaChart, Bar, BarChart, LabelList, CartesianGrid, XAxis, YAxis } from "recharts"



import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "../components/ui/chart"
import { Box, Paper } from "@mui/material"
import { DatePickerWithRange } from "./DateRange"
import { useCallback, useMemo, useState } from "react"
import { CrimsonButton } from "./IUButton"
import useAsyncRequest from "../CustomHooks/useAsyncRequest"
import { ReportData } from "../Objects/ReportData"
import { ChartLoading } from "./ChartLoading"

const chartConfig = {
    loginCount: {
        label: "Login",
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
              
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-logoffCount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-logoffCount)"
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
              dataKey="loginCount"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-loginCount)"
              stackId="a"
            />
            <Area
              dataKey="logoffCount"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-logoffCount)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </>)
}

function LogDataBarChart({ Data }) {
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
                        <Bar dataKey="loginCount" fill="var(--color-loginCount)" radius={4}>
                            <LabelList
                                position="top"
                                offset={6}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>

                        <Bar dataKey="logoffCount" fill="var(--color-logoffCount)" radius={4} >
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

export function LogDataChart() {

    const SEVEN_DAYS = 7 * (24 * 60 * 60 * 1000);
    const [date, setDate] = useState({
        from: new Date( ( new Date() ).getTime() - SEVEN_DAYS ),
        to: new Date( ( new Date() ).getTime() ),
    });
    const [logData, setData] = useState(null);
    const [loadingData, setLoading] = useState(false);

    let getLogData = useCallback(async () => {
      const dateFormat = {
        month: "numeric", 
        day: "numeric", 
        year: "numeric" 
      }

      setLoading(true);
      setData(<ChartLoading />);
      const startDate = new Date(date?.from)
                        ?.toLocaleDateString('en-US', dateFormat);
      
      const endDate = new Date(date?.to)
                        ?.toLocaleDateString('en-US', dateFormat);
      
      const invalidDateProvided = startDate === "Invalid Date" ||
                                  endDate === "Invalid Date"
      if (invalidDateProvided) {
        console.log("You provided an invalid date.")
        setLoading(false);
        return;
      }

      let reportsObj = new ReportData({
        StartDate: startDate,
        StopDate: endDate
      });

      let allLogs = await reportsObj.getAllLogs();
      let data = null;
      const ONE_DAY_IN_MILISECONDS = 1000 * 60 * 60 * 24;
      const ELLAPSED_TIME = Math.abs(date?.to - date?.from);
      let dateRange = Math.floor( ELLAPSED_TIME / ONE_DAY_IN_MILISECONDS );
      let dateRangeGreaterThanHalfMonth = dateRange > 15;
      if (dateRangeGreaterThanHalfMonth) {
          // use continous prop
          data = <LogDataContinuousChart Data={allLogs} />
      } else {
          data = <LogDataBarChart Data={allLogs} />
      }

      setData(data);
      setLoading(false);
      console.log(startDate, endDate);
    }, [date]);

    useAsyncRequest( async () => {
      await getLogData();
    }, []);


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

    return (
        <Paper elevation={4}>
            <Card>
                <CardHeader>
                    <CardTitle>Login / Logout Events</CardTitle>
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
                        <CrimsonButton
                          onClick={getLogData}
                          disabled = {loadingData === true}
                        >Get Logs</CrimsonButton>
                        </Box>
                        <Box
                            display={"flex"}
                            alignContent={"end"}
                            justifyContent={"end"}
                        >
                        </Box>
                    </Box>
                </CardHeader>

                    {logData}
                
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