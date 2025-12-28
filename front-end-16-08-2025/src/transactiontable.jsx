// import React, { useState } from "react";

// function TrasnsactionTable() {
//   const [message, setMessage] = useState("");
//   const [response, setResponse] = useState("");

//   const sendMessage = async () => {
//     const res = await fetch("http://127.0.0.1:8000/echo/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ text: message }),
//     });
//     const data = await res.json();
//     setResponse(data.received_text);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Send Message to FastAPI</h2>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type something..."
//       />
//       <button onClick={sendMessage}>Send</button>

//       <h3>Response from API:</h3>
//       <p>{response}</p>
//     </div>
//   );
// }

// export default TrasnsactionTable;


//...................................................


import React, { useCallback, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Box, IconButton, Button, useMediaQuery, Typography, Chip, Snackbar, Alert } from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import AddTransactionData from './addtransaction';
import EditTransactionData from './edittransaction';
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import BudgetComponent from './budgetcomponent';
import API from './api';






// const initialRows = [
//     { id: 1, name: 'Ragesh1', email: 'ragesh@example.com' },
//     { id: 2, name: 'Ragesh', email: 'ragesh@example.com' },
//     { id: 3, name: 'Ragesh', email: 'ragesh@example.com' },
// ];

export default function SearchableDataGrid() {
    const [searchText, setSearchText] = useState('');
    const [allRows, setAllRows] = useState([]);
    const [rows, setRows] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState();
    const [selectedIdsForDelete, setSelectedIdsForDelete] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // success | error | warning | info

    const [userTotalAmount, setUserTotalAmount] = useState(0); // current amount spent in this month
    let timeoutId;


    const isSmallScreen = useMediaQuery("(max-width:600px)");
    const theme = useTheme();
    const mode = theme.palette.mode;


    const columns = [
        {
            field: 'serial',
            headerName: 'S.No',
            width: isSmallScreen ? 80 : 80,  // wider on small screens
            sortable: false,
            align: "center", headerAlign: "center",
            filterable: false,
            renderCell: (params) => {
                const visibleSortedRows = params.api.getSortedRowIds();
                const index = visibleSortedRows.indexOf(params.id);
                return index + 1;
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: isSmallScreen ? 90 : 80,  // wider on small screens
            sortable: false,
            renderCell: (params) => (
                <IconButton color="primary" onClick={() => handleOpenEditDialog(params.row.id)}>
                    <EditIcon />
                </IconButton>
            ),
        },
        {
            field: 'amount', headerName: 'Amount', flex: isSmallScreen ? 2 : 0.5, minWidth: isSmallScreen ? 150 : 50, align: "center", headerAlign: "center",
            renderCell: (params) => {
                const value = params.value || "";
                return <span>{"Rs." + value}</span>;
            },
        },
        { field: 'category', headerName: 'Category', flex: isSmallScreen ? 2 : 0.5, minWidth: isSmallScreen ? 150 : 100, align: "center", headerAlign: "center" },

        {
            field: 'transactionType', headerName: 'Transaction Type', flex: isSmallScreen ? 2 : 0.5, minWidth: isSmallScreen ? 150 : 100, align: "center", headerAlign: "center",
            renderCell: (params) => {
                const value = params.value;

                if (!value) return null;

                if (value.toLowerCase().includes("expense")) {
                    return <Chip label={value} color="error" size="small" sx={{ padding: "2px 6px", margin: "0 auto" }} />;
                }
                else {
                    return <Chip label={value} color="success" size="small" sx={{ padding: "2px 10px", margin: "0 auto" }} />;
                }

                return <span>{value}</span>;
            }
        },

        {
            field: 'transactionDate', headerName: 'Transaction Date', flex: isSmallScreen ? 2 : 0.5, minWidth: isSmallScreen ? 150 : 100, align: "center", headerAlign: "center",
            renderCell: (params) => {
                const raw = params.value;
                if (!raw) return <span>-</span>; // fallback for null/undefined

                // Convert to valid date (replace space for ISO compatibility)
                const date = new Date(raw.replace(' ', 'T'));

                //Format only the date
                const formatted = date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                });

                return <span>{formatted}</span>;
            },
        },
        { field: 'transactionDescription', headerName: 'Transaction Description', flex: isSmallScreen ? 2 : 1, minWidth: isSmallScreen ? 500 : 150, align: "center", headerAlign: "center" },
        // {
        //     field: 'nextRecurringDate', headerName: 'NextRecurringDate', flex: 1,
        //     renderCell: (params) => {
        //         const raw = params.value;
        //         if (!raw) return <span>-</span>; // fallback for null/undefined

        //         // Convert to valid date (replace space for ISO compatibility)
        //         const date = new Date(raw.replace(' ', 'T'));

        //         // Format only the date
        //         const formatted = date.toLocaleDateString('en-IN', {
        //             year: 'numeric',
        //             month: 'short',
        //             day: '2-digit',
        //         });

        //         return <span>{formatted}</span>;
        //     },


        // },

    ];

    useEffect(() => {
        setLoading(true);
        getTransactionsRecord();
        setLoading(false);

        //// After 15 seconds, if still loading, show snackbar
        // timeoutId = setTimeout(() => {
        //     if (loading) {
        //         setSnackbarMessage("Something went wrong!");
        //         setSnackbarSeverity("error");
        //     }
        // }, 15000);

        // return () => {
        //     clearTimeout(timeoutId);
        // };

    }, [])

    const getTransactionsRecord = async () => {
        const payload = { "userid": 1 };

        try {
            const res = await API.post("/transactionsrecord", payload);
            console.log("Response from API:", res.data);
            const initialRows = res.data;
            setAllRows(initialRows)
            setRows(initialRows)

            const now = dayjs();
            const startOfMonth = now.startOf("month");
            const endOfMonth = now.endOf("month");

            //          const totalPrice = allRows
            //     .filter((item) => {
            //         const itemDate = dayjs(item.transactionDate, "YYYY-MM-DD HH:mm:ss.SSSS");

            //         // Filter by `add: yes` and current month
            //         return (
            //             item.transactionType.toLowerCase() === "expense" &&
            //             itemDate.isAfter(startOfMonth.subtract(1, "day")) &&
            //             itemDate.isBefore(endOfMonth.add(1, "day"))
            //         );
            //     })
            //     .reduce((sum, item) => sum + item.amount, 0);

            // setUserTotalAmount(totalPrice);



        } catch (err) {
            console.error("Error:", err);
        }
    };

    console.log("all rows", allRows)


    //  setUserTotalAmount(
    //     allRows.filter((item) => {
    //       const d = dayjs(item.transactionDate, "YYYY-MM-DD HH:mm:ss.SSSS");
    //       return item.transactionType?.toLowerCase() === "expense" && d.isBetween(start, end, null, "[]");
    //     }));

    //   console.log("total price", userTotalAmount)

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        if (value === "") {
            setRows(allRows)
        }
        else {
            const filteredRows = allRows.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(value)
                )
            );
            setRows(filteredRows);
        }
    };

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }



    const handleDelete = async () => {
        if (selectedIdsForDelete.length > 0) {
            const payload = { "action": "delete", "userid": 1, "ids": selectedIdsForDelete }
            try {
                const response = await API.post("/addtransaction", payload);
                getTransactionsRecord();
                if (response.data.status === 'success') {
                    setSnackbarMessage("Deleted successfully!");
                    setSnackbarSeverity("success");
                    setOpenSnackbar(true);
                }
                else {
                    setSnackbarMessage("Failed to Delete!");
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);
                }

            } catch (error) {

                console.error("Error sending data:", error);
            }
            console.log("delete row ids... : ", selectedIdsForDelete)
        } else {
            setSnackbarMessage("Please Select Records to Delete");
            setSnackbarSeverity("warning");
            setOpenSnackbar(true);
        }
    }

    const handleSelectionChange = (sel) => {
        if (!sel) {
            setSelectedIdsForDelete([]);
            return;
        }

        let idsArray = [];

        if (Array.isArray(sel)) {
            // normal individual row selection
            idsArray = sel;
        } else if (sel instanceof Set) {
            idsArray = Array.from(sel);
        } else if (sel.type === "exclude") {
            // all selected except these
            const excludedIds = Array.from(sel.ids);
            idsArray = rows
                .map((row) => row.id)       // get all row IDs
                .filter((id) => !excludedIds.includes(id));
        } else if (sel.type === "include") {
            // only these selected
            idsArray = Array.from(sel.ids);
        }

        setSelectedIdsForDelete(idsArray);
        console.log("Selected IDs:", idsArray);
    };

    const handleOpenEditDialog = async (id) => {
        setOpenEditDialog(true);


        const payload = { "id": id };
        console.log("payload..............edit record id:", id)
        try {
            const res = await API.post("/editrecord", payload);
            console.log("edit record:", res.data);
            const recordForEdit = res.data;
            setEditRecord(recordForEdit);
        }
        catch (err) {
            console.error("Error:", err);
        }
        console.log("chose edit id....:", id)
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    }

    console.log("Selected idss ....", selectedIdsForDelete)



    return (
        <Box sx={{ height: '100%', width: '100%', mt: 1 }}>
            {/* <Typography
                sx={{
                    fontSize: { xs: '20px', md: '28px' },
                    fontWeight: 'bold',
                    padding: 0.7
                }}
                gutterBottom
            >
                Dashboard
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        //   backgroundColor: mode === "dark" ? "white" : "black",
                        //   color: mode === "dark" ? "black" : "white",
                        padding: isSmallScreen ? "7px" : "10px",
                        //   "&:hover": { backgroundColor: mode === "dark" ? "#f0f0f0" : "#333" },
                        backgroundColor:
                            theme.palette.mode === "dark" ? "#2b2b2b" : "black",
                        color:
                            theme.palette.mode === "dark" ? "#fff" : "#fff",
                        "&:hover": {
                            backgroundColor:
                                theme.palette.mode === "dark" ? "#3a3a3a" : "#3a3a3a",
                        },
                        transition: "background-color 0.3s ease",
                    }}
                    onClick={handleOpen}
                >
                    Add Transaction
                </Button>

                <Button
                    onClick={handleDelete}
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: "red",
                        color: "white",
                        padding: isSmallScreen ? "7px" : "10px",
                        "&:hover": { backgroundColor: "#b71c1c" },
                    }}
                >
                    Delete
                </Button>

                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={handleSearch}
                />
            </Box> */}


            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 1,
                    width: "100%",
                    flexWrap: "wrap", // allows wrapping on very small screens
                }}
            >
                {/* LEFT: title (stays at start/left) */}
                <Box sx={{ display: "flex", alignItems: "center", flex: "0 1 auto" }}>
                    {/* <Typography
                        sx={{
                            fontSize: { xs: "20px", md: "28px" },
                            fontWeight: "700",
                            m: 0,
                        }}
                        gutterBottom={false}
                    >
                        Your Transactions
                    </Typography> */}

                    <Typography
                        variant="h5"
                        sx={{
                            background: "linear-gradient(90deg, #42a5f5, #80d6ff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 700,
                            p: 1,
                            fontSize: { xs: "20px", md: "28px" },
                            fontFamily: "'Poppins', sans-serif",
                            textTransform: "capitalize",
                        }}
                    >
                        Your Transactions
                    </Typography>
                </Box>

                {/* RIGHT: controls (stays at end/right) */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flex: "0 1 auto",
                        // keeps controls on a single row until space runs out
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            padding: isSmallScreen ? "7px" : "10px",
                            backgroundColor: theme.palette.mode === "dark" ? "#2b2b2b" : "#000",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#3a3a3a" },
                            transition: "background-color 0.3s ease",
                        }}
                        onClick={handleOpen}
                    >
                        Add Transaction
                    </Button>

                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: "red",
                            color: "white",
                            padding: isSmallScreen ? "7px" : "10px",
                            "&:hover": { backgroundColor: "#b71c1c" },
                        }}
                    >
                        Delete
                    </Button>

                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={searchText}
                        onChange={handleSearch}
                        sx={{ minWidth: { xs: 120, sm: 160 } }} // keeps reasonable width on small screens
                    />
                </Box>
            </Box>


            <Box sx={{ height: "83vh" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    sortingOrder={['asc', 'desc']}
                    rowHeight={38}
                    columnHeight={38}
                    columnHeaderHeight={43}
                    checkboxSelection
                    loading={loading}
                    getRowId={(row) => row.id}
                    onRowSelectionModelChange={handleSelectionChange}
                    disableRowSelectionOnClick
                    getRowHeight={() => (isSmallScreen ? 35 : 45)}

                    sx={{
                        marginTop: "10px",

                        "& .MuiDataGrid-cell": {
                            py: isSmallScreen ? 0.1 : 0.2,
                            fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                            justifyContent: "center",  // horizontal center
                            textAlign: "center",
                        },

                        "& .MuiDataGrid-columnHeaders": {

                            fontWeight: "bold",
                           // fontSize: "1rem",
                            fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                        },
                        // "& .MuiDataGrid-columnHeader": {
                        //     justifyContent: "center",  
                        //     textAlign: "center",
                        // },
                    }}

                />

            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <AddTransactionData openNew={open} closeNew={handleClose} refreshTableData={getTransactionsRecord} />
            <EditTransactionData refreshTableData={getTransactionsRecord} openEdit={openEditDialog} closeEdit={handleCloseEditDialog} chosenEditRecord={editRecord} />
            {/* 
            {<BudgetComponent userTotalAmount={userTotalAmount} />} */}
        </Box>
    );
}
