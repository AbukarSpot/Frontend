import { Autocomplete, Skeleton, TextField } from "@mui/material";
import { User } from "./api/UserHandler";

export function CustomAutocomplete({ 
    isLoading = true, 
    options = [] as User[],
    getLabel = (option: any) => "", 
    requestFailed = false, 
    errMsg = "",
    label = ""
}) {

    if (isLoading) {
        return <Skeleton 
                    variant="rounded" 
                    animation="wave"
                    height={"100%"}/>
    }

    if (requestFailed) {
        return <Autocomplete 
                    disabled = {true}
                    options={options}
                    renderInput={(params) => <></>}
                    noOptionsText = {errMsg}
                />
    }

    return (<>
        <Autocomplete
                    size="small" 
                    options={options}
                    getOptionLabel={getLabel}
                    renderInput={(params) => <TextField {...params} label={label} />}
        />
    </>);
}