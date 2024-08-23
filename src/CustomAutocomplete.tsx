import { Autocomplete, Skeleton, TextField } from "@mui/material";
import { User } from "./api/UserHandler";

interface CustomAutocompleteProps<T>{
    isLoading?: boolean, 
    options: T[] | undefined,
    getLabel: ((option: T) => string), 
    onChange: (value: string | null) => void;
    requestFailed:boolean, 
    errMsg?: string,
    label?: string
}

export function CustomAutocomplete<T>({ 
    isLoading = true, 
    options = [],
    getLabel = () => "", 
    onChange = () => {},
    requestFailed = false, 
    errMsg = "",
    label = ""
}: CustomAutocompleteProps<T>) {

    if (isLoading) {
        return <Skeleton 
                    variant="rounded" 
                    animation="wave"
                    height={"100%"}/>
    }

    if (requestFailed) {
        return <Autocomplete 
                    size="small" 
                    disabled = {true}
                    options={options}
                    noOptionsText = {errMsg}
                    renderInput={(params) => <TextField {...params} label={label} />}
                />
    }

    return (<>
        <Autocomplete
                    size="small" 
                    options={options}
                    getOptionLabel={o => getLabel(o)}
                    onInputChange={(e) => {
                        const selectedLabel = e?.currentTarget?.textContent;
                        onChange(selectedLabel ?? null);
                    }}
                    renderInput={(params) => <TextField {...params} label={label} />}
        />
    </>);
}