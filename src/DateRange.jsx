import { Box } from "@mui/material";
import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format, getDate } from "date-fns"
import { DateRange } from "react-day-picker"
 
import { cn } from "./libs/utils"
import { Button } from "./components/ui/button"
import { Calendar } from "./components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover"
import { Warning } from "@mui/icons-material";

export function DatePickerWithRange({
  className,
  GetData
}) {

  const SEVEN_DAYS = 7 * (24 * 60 * 60 * 1000);
  const [date, setDate] = React.useState({
    from: ( new Date() ).getTime() - SEVEN_DAYS,
    to: ( new Date() ).getTime(),
  })
 
  const setDateOption = (dateOption) => {
    setDate(dateOption);
    GetData(dateOption);
  }

  // implement warning
  const warningIcon = <Warning fontSize="small"/>;
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground" 
            )}
          >
            <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                date.to ? (
                    <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                    </>
                ) : (
                    format(date.from, "LLL dd, y")
                )
                ) : (
                <Box
                    display={"flex"}
                    alignContent={"center"}
                    justifyContent={"center"}
                    gap={"1rem"}
                >
                    <span>Pick date range</span>
                    {warningIcon}
                </Box>
                )}
            </>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDateOption}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}