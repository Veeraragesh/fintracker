import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    IconButton,
    MenuItem,
    Box,
    Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
import { createFilterOptions } from "@mui/material/Autocomplete";
import API from './api';
import { useSnackbar } from "./snackbarcontext";
import axios from "axios";
import dayjs from "dayjs";


export default function EditTransactionData({ refreshTableData, openEdit, closeEdit, chosenEditRecord }) {

    // individual states
    const [transactionType, setTransactionType] = useState("");
    const [amount, setAmount] = useState("");
    const [transactionDescription, setTransactionDescription] = useState("");
    const [transactionDate, setTransactionDate] = useState(null);
    const [category, setCategory] = useState("");
    const [chosenEditRecordId, setChosenEditRecordId] = useState("");
    
    //  const [isRecurring, setIsRecurring] = useState("");
    //   const [recurringInterval, setRecurringInterval] = useState("");
    //   const [nextRecurringDate, setNextRecurringDate] = useState("");

    // error states
    // const [errors, setErrors] = useState({});

      const { showSnackbar } = useSnackbar();


    // options
    const dropdown1Options = ["Expense", "Income"];
    const dependentOptions = {
        Expense: ["Food", "Groceries", "Housing", "Transportation", "Entertainment", "Shopping", "Healthcare", "Personal Care", "Fees", "Insurance", "Donations", "Bills", "Gifts"],
        Income: ["Salary", "Freelance", "Investments", 'Rental', 'Business'],
    };
    const dropdown6Options = ["Yes", "No"];
    const dropdown7Options = ["Daily", "Weekly", "Monthly", "Yearly"];

    const today = dayjs();

    const filter = createFilterOptions();

    const unitMap = {
        Daily: "day",
        Weekly: "week",
        Monthly: "month",
        Yearly: "year",
    };

    // useEffect(() => {
    //     {
    //         chosenEditRecordId &&
    //             getEditRecord();
    //     }

    // }, [chosenEditRecordId])

     useEffect(() => {
    if (chosenEditRecord) {
                  chosenEditRecord.map((val) => {
                // val.isRecurring === 1 ? setIsRecurring("Yes") : setIsRecurring("No")
                setTransactionType(val.transactionType);
                setAmount(val.amount);
                setCategory(val.category);
                // setRecurringInterval(val.recurringInterval);
                setTransactionDate(dayjs(val.transactionDate));
                setTransactionDescription(val.transactionDescription);
                setChosenEditRecordId(val.id)
            })
        }
  }, [chosenEditRecord]);

    console.log("chosen edit record component:",chosenEditRecord)

    // const getEditRecord = async () => {
    //     const payload = { "id": chosenEditRecordId, "userid": 1 };
    //     console.log("payload..............edit record id:",chosenEditRecordId)
    //     try {
    //         const res = await axios.post("http://127.0.0.1:8000/editrecord", payload);
    //         console.log("Response from edit record API:", res.data);
    //         const recordForEdit = res.data;
    //         recordForEdit.map((val) => {
    //             // val.isRecurring === 1 ? setIsRecurring("Yes") : setIsRecurring("No")
    //             setTransactionType(val.transactionType);
    //             setAmount(val.amount);
    //             setCategory(val.category);
    //             // setRecurringInterval(val.recurringInterval);
    //             setTransactionDate(dayjs(val.transactionDate));
    //             setTransactionDescription(val.transactionDescription);
    //         })
    //     } catch (err) {
    //         console.error("Error:", err);
    //     }
    // };




    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedTransactionDate = transactionDate.format("YYYY-MM-DD HH:mm:ss");
        //    const isRecurringValue = isRecurring === "Yes" ? 1 : 0

        //handling the recurring date field
        // if (isRecurringValue === 1) {
        //     const unit = unitMap[recurringInterval]; // convert "Daily" → "day"
        //     const newDate = transactionDate.add(1, unit);
        //     const newDateFormattedValue = newDate.format("YYYY-MM-DD HH:mm:ss");

        //     setNextRecurringDate(newDateFormattedValue)
        // }



        const payload = {
            action: "update",
            id: chosenEditRecordId,
            transactionType,
            amount,
            transactionDescription,
            transactionDate: formattedTransactionDate,
            category,
            //  isRecurring: isRecurringValue,
            //  recurringInterval: isRecurring !== 1 ? "" : recurringInterval,
            //  nextRecurringDate: isRecurring !== 1 ? null : nextRecurringDate,
        };

        console.log("Form Data:", {
           
            action: "update",
            id: chosenEditRecordId,
            transactionType,
            amount,
            transactionDescription,
            transactionDate: formattedTransactionDate,
            category,
            // isRecurring,
            // recurringInterval,
        });

        try {
            const response = await API.post("/addtransaction", payload);
            console.log("Backend response:", response.data);
            closeEdit();
            handleClear();
            refreshTableData();
             if (response.data.status === 'success') {
                showSnackbar("Updated successfully!", "success")
            } else {
                showSnackbar("Failed to Update!", "error");

            }

        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    const handleClear = () => {
        setTransactionType("");
        setAmount("");
        setTransactionDescription("");
        setTransactionDate(null);
        setCategory("");
        //  setIsRecurring("");
        //  setRecurringInterval("");
        //  setErrors({});
    };

    return (
        <Dialog open={openEdit} onClose={closeEdit} maxWidth="sm" fullWidth>
            <DialogTitle>
                Edit Transaction
                <IconButton
                    aria-label="close"
                    onClick={closeEdit}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
                >
                    {/* 1. Dropdown */}
                    <TextField
                        select
                        fullWidth
                        label="Transaction Type"
                        value={transactionType}
                        onChange={(e) => {
                            setTransactionType(e.target.value);
                            setCategory(""); // reset dependent
                        }}
                        required
                    >
                        {dropdown1Options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* 2. Number */}
                    <TextField
                        type="number"
                        label="Amount"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    {/* 3. Long Text */}
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={transactionDescription}
                        onChange={(e) => setTransactionDescription(e.target.value)}
                        required
                    />

                    {/* 4. Date Time */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Date & Time"
                            value={transactionDate}
                            onChange={(newValue) => setTransactionDate(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                },
                            }}

                        />
                    </LocalizationProvider>

                    {/* 5. Dependent Dropdown */}
                    {/* <Autocomplete
                        options={transactionType ? dependentOptions[transactionType] : []}
                        value={category || null}
                        onChange={(e, newValue) => setCategory(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Category"
                                placeholder="Search or select..."
                                fullWidth
                                required
                            />
                        )}
                        disabled={!transactionType}
                    /> */}

                    {/* Dependent searchable dropdown with custom entry */}
                    <Autocomplete
                        ListboxProps={{
                            style: {
                                maxHeight: 130,
                                overflow: "auto",
                            },
                        }}
                        select
                        value={category}
                        onChange={(event, newValue) => {
                            if (typeof newValue === "string") {
                                // User typed and hit Enter
                                setCategory(newValue);
                            } else if (newValue && newValue.inputValue) {
                                // User chose "Add 'xxx'"
                                setCategory(newValue.inputValue);
                            } else {
                                setCategory(newValue);
                            }
                        }}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);

                            const { inputValue } = params;
                            const isExisting = options.some(
                                (option) => inputValue.toLowerCase() === option.toLowerCase()
                            );

                            if (inputValue !== "" && !isExisting) {
                                filtered.push({
                                    inputValue,
                                    title: `Add "${inputValue}"`,
                                });
                            }

                            return filtered;
                        }}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        options={transactionType ? dependentOptions[transactionType] : []}
                        getOptionLabel={(option) => {
                            if (typeof option === "string") return option;
                            if (option.inputValue) return option.inputValue;
                            return option.title || option;
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                {option.inputValue ? (
                                    <>
                                        <AddIcon fontSize="small" sx={{ mr: 1 }} /> {option.title}
                                    </>
                                ) : (
                                    option
                                )}
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Category"
                                placeholder="Search or add your own category"
                                fullWidth
                                required
                            />
                        )}
                        disabled={!transactionType}
                    />

                    {/* 6. Dropdown */}
                    {/* <TextField
                        select
                        fullWidth
                        label="Is Recurring ?"
                        value={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.value)}
                        required
                    >
                        {dropdown6Options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField> */}

                    {/* 7. Dropdown */}
                    {/* {isRecurring === "Yes" &&
                        <TextField
                            select
                            fullWidth
                            label="Recurring Interval"
                            value={recurringInterval}
                            onChange={(e) => setRecurringInterval(e.target.value)}
                            required
                        >

                            {dropdown7Options.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </TextField>
                    } */}
                    {/* Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button type="submit" variant="contained">
                            Submit
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
