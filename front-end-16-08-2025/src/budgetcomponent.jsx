// LimitProgressCardResponsive.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    LinearProgress,
    Alert,
    Paper,
    Stack,
    useTheme,
    useMediaQuery,
    Grid,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Card, CardContent,
    List, ListItem, ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import API from './api';
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
import { Pie } from "react-chartjs-2";
import { Doughnut, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale } from "chart.js";


// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels, BarElement, CategoryScale, LinearScale,);


export default function BudgetComponent() {


    const [showAddInput, setShowAddInput] = useState(false);
    // const [tempValue, setTempValue] = useState(""); // for the Add input
    const [userTotalAmount, setUserTotalAmount] = useState(0); // current number
    const [budgetAmount, setbudgetAmount] = useState(0); // limit  -> this is the amount which is budget only this amount they can spend otherwise we will show alert
    const theme = useTheme();
    const [transactionData, setTransactionData] = useState([]);
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const [filteredTotalAmount, setFilteredTotalAmount] = useState([])

    const [filterExpenses, setFilterExpenses] = useState("last6Months");
    const [filteredDataExpenses, setFilteredDataExpenses] = useState([]);

    const [filterIncomes, setFilterIncomes] = useState("last6Months");
    const [filteredDataIncomes, setFilteredDataIncomes] = useState([]);

    const [transactionMode, setTransactionMode] = useState("expense");
    const [dateFilter, setDateFilter] = useState("thisMonth");

    const [filterBarChart, setFilterBarChart] = useState("last6Months");

    const isSmall = useMediaQuery(theme.breakpoints.down("md"));

    const isDarkMode = theme.palette.mode === 'dark';
    const labelColor = isDarkMode ? 'white' : 'black';




    useEffect(() => {
        if (transactionData.length > 0 && filterExpenses) {
            applyFilterExpenses();
        }
    }, [transactionData, filterExpenses]);


    useEffect(() => {
        if (transactionData.length > 0 && filterIncomes) {
            applyFilterIncomes();
        }
    }, [transactionData, filterIncomes]);

    useEffect(() => {

        GetBudgetDetails();
        getTransactionsRecord();
    }, [])

    useEffect(() => {
        calculatingTotalAmount();
    }, [transactionData])




    // compute percent (guard divide by zero)
    const percent = useMemo(() => {
        const limit = Number(budgetAmount) || 0;
        if (limit <= 0) return 0;
        const p = (Number(userTotalAmount) / limit) * 100;
        return Math.min(Math.max(p, 0), 100);
    }, [userTotalAmount, budgetAmount]);

    const exceeded = Number(userTotalAmount) > Number(budgetAmount);



    const GetBudgetDetails = async () => {
        try {

            const response = await API.get("/budgetamount");
            console.log("Backend res budget amount:", response.data.budgetresult[0].amount);
            const settingBudgetAmount = response.data.budgetresult[0].amount;
            setbudgetAmount(settingBudgetAmount ? settingBudgetAmount : 0)   // if user entered the amount it will be stored otherwise 0 will be shown


        } catch (error) {
            console.error("Error sending data:", error);
        }
    }

    const getTransactionsRecord = async () => {
        const payload = { "userid": 1 };

        try {
            const res = await API.post("/transactionsrecord", payload);
            const initialRows = res.data;
            setTransactionData(initialRows);
        } catch (err) {
            console.error("Error:", err);
        }
    };
    console.log("total monthly expenses", userTotalAmount)

    const calculatingTotalAmount = () => {

        const start = dayjs().startOf("month");
        const end = dayjs().endOf("month");

        console.log("start month: ", start);
        console.log("end month: ", end);
        const filtered = transactionData.filter((item) => {
            const d = dayjs(item.transactionDate, "YYYY-MM-DD HH:mm:ss.SSSS");
            return item.transactionType.toLowerCase() === "expense" && d.isBetween(start, end, null, "[]");
        });

        console.log("filtered dataaaa..", filtered);

        const totalPrice = filtered.reduce((sum, item) => sum + (item.amount || 0), 0);

        // setFilteredData(filtered);
        setUserTotalAmount(totalPrice);

    }


    const handleSetBudget = async () => {
        const v = Number(budgetAmount);
        if (!Number.isFinite(v)) return; // ignore invalid
        setShowAddInput(false);

        const payload = {
            userid: 1, amount: budgetAmount
            //lastAlertSend: ""
        }
        try {
            const response = await API.post("/addbudget", payload);
            console.log("Backend response:", response.data);
            if (response.data.status === 'success') {
                showSnackbar("Budget set successfully!", "success")
            } else {
                showSnackbar("Budget failed to set!", "error");

            }

        } catch (error) {
            console.error("Error sending data:", error);
        }
    };

    // Example data
    const data = [
        { category: "Food", price: 500 },
        { category: "Transport", price: 200 },
        { category: "Shopping", price: 300 },
        { category: "Bills", price: 100 },
        { category: "Entertainment", price: 150 },
    ];

    const applyFilterExpenses = () => {
        const today = dayjs();
        let startDate;
        let filtered = [];

        switch (filterExpenses) {
            case "today":
                startDate = today.startOf("day");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isSame(today, "day")
                );
                break;

            case "thisWeek":
                startDate = today.startOf("week");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "thisMonth":
                startDate = today.startOf("month");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "last6Months":
                startDate = today.subtract(6, "month");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "lastYear":
                startDate = today.subtract(1, "year");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "last5Years":
                startDate = today.subtract(5, "year");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            default:
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "expense"
                );
                break;
        }
        console.log("filter 1..", filtered)
        setFilteredDataExpenses(filtered);


    };

    const applyFilterIncomes = () => {
        const today = dayjs();
        let startDate;
        let filtered = [];

        switch (filterIncomes) {
            case "today":
                startDate = today.startOf("day");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isSame(today, "day")
                );
                break;

            case "thisWeek":
                startDate = today.startOf("week");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "thisMonth":
                startDate = today.startOf("month");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "last6Months":
                startDate = today.subtract(6, "month");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "lastYear":
                startDate = today.subtract(1, "year");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            case "last5Years":
                startDate = today.subtract(5, "year");
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income" &&
                    dayjs(item.transactionDate).isAfter(startDate)
                );
                break;

            default:
                filtered = transactionData.filter(item =>
                    item.transactionType.toLowerCase() === "income"
                );
                break;
        }
        console.log("filter 1..", filtered)
        setFilteredDataIncomes(filtered);


    };
    console.log("filter data incomes..", filteredDataIncomes)

    //  Sort descending (highest first)
    const chdata = transactionMode === "expense" ? [...filteredDataExpenses].sort((a, b) => b.amount - a.amount) : [...filteredDataIncomes].sort((a, b) => b.amount - a.amount);

    //  Group by category to remove duplicates
    const grouped = chdata.reduce((acc, item) => {
        const key = item.category.trim();
        acc[key] = (acc[key] || 0) + item.amount;
        return acc;
    }, {});

    //  Convert to array + sort
    const sorted = Object.entries(grouped)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    // Keep top 8 categories and merge "Others"
    const topCategories = sorted.slice(0, 8);
    const others = sorted.slice(8);
    if (others.length > 0) {
        const othersTotal = others.reduce((sum, i) => sum + i.value, 0);
        topCategories.push({ label: "Others", value: othersTotal });
    }

    //  Prepare chart data
    const labels = topCategories.map((i) => i.label);
    const values = topCategories.map((i) => i.value);
    const total = values.reduce((a, b) => a + b, 0);

    const colors = Array.from(
        { length: labels.length },
        (_, i) => `hsl(${(i * 360) / labels.length}, 70%, 55%)`
    );

    //  Chart.js dataset
    const chartData = {
        labels,
        datasets: [
            {
                label: "Expenses",
                data: values,
                backgroundColor: colors,
                borderColor: "#fff",
                borderWidth: 2,
            },
        ],
    };

    // 7️⃣ Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false, // ensures chart fills container
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: { size: 13 },
                    boxWidth: 15,
                    //   color: "white",
                },
            },
            tooltip: {
                bodyColor: "white",
                titleColor: "white",
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ₹${value} (${percentage}%)`;
                    },
                },
            },
            datalabels: {
                color: "white",
                font: {
                    weight: "bold",
                    size: 12,
                },
                formatter: (value, context) => {
                    const percentage = ((value / total) * 100).toFixed(1);
                    if (percentage < 3) return "";
                    return `${context.chart.data.labels[context.dataIndex]}\n${percentage}%`;
                },
            },
        },
    };

    // recent transactions

    const recentTransactions = transactionData.slice(-5).reverse(); // last 5

    console.log("transaction data last 5", recentTransactions)

    //bar chart

    const today = dayjs();
    let startDate;

    switch (filterBarChart) {
        case "today":
            startDate = today.startOf("day");
            break;
        case "thisMonth":
            startDate = today.startOf("month");
            break;
        case "last6Months":
            startDate = today.subtract(6, "month");
            break;
        default:
            startDate = dayjs("2000-01-01"); // fallback
    }

    const filtered = transactionData.filter(item =>
        dayjs(item.transactionDate).isAfter(startDate)
    );

    const incomeTotal = filtered
        .filter(item => item.transactionType.toLowerCase() === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const expenseTotal = filtered
        .filter(item => item.transactionType.toLowerCase() === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    const barData = {
        labels: ["Income", "Expense"],
        datasets: [
            {
                label: "Amount",
                data: [incomeTotal, expenseTotal],
                backgroundColor: ["#4CAF50", "#F44336"], // green for income, red for expense
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                color: labelColor,
                anchor: 'end',
                align: 'top',
                font: {
                    weight: 'bold',
                    size: 12,
                },
                // formatter: (value) => `₹${value}`, // optional: format value
                formatter: (value) => `Rs.${value}`,
            },

            tooltip: {
                callbacks: {
                    // label: context => `₹${context.raw}`,
                    label: context => `Rs.${context.raw}`,
                },
            },
        },
        scales: {
            x: {
                ticks: { color: labelColor, font: { size: 14 } },
                grid: { display: false },
            },
            y: {
                ticks: { color: labelColor, font: { size: 14 } },
                grid: { color: "#555" },
            },
        },
    };


    return (
        <>
            <Box sx={{
                height: "100%",
                width: "100%",
                p: 1.5
            }}>
                <Typography
                    variant="h5"
                    sx={{
                        background: "linear-gradient(90deg, #42a5f5, #80d6ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 700,
                        padding: 1,
                        fontSize: { xs: "20px", md: "28px" },
                        fontFamily: "'Poppins', sans-serif",
                        textTransform: "capitalize",
                    }}
                >
                    Dashboard
                </Typography>
                <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, mx: "auto", width: "100%", mt: 1 }}>
                    <Stack spacing={1}>
                        {/* Top row: date + Add button
              On xs -> stack vertically (date above Add button),
              on sm+ -> show on one row. */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                flexDirection: { xs: "column", sm: "row" },
                            }}
                        >


                            <Button
                                variant={showAddInput ? "contained" : "outlined"}
                                startIcon={<AddIcon />}
                                size={isXs ? "medium" : "small"}
                                onClick={() => {
                                    setShowAddInput((s) => !s);
                                }}
                                fullWidth={isXs}
                                sx={{
                                    maxWidth: { xs: "100%", sm: 160 },
                                    alignSelf: { xs: "stretch", sm: "auto" },
                                }}
                            >
                                Add Budget
                            </Button>
                        </Box>

                        {/* Add input (inline) - stack on xs */}
                        {showAddInput && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    //   justifyContent: {xs:"space-between"},
                                    gap: 1,
                                    width: "100%",
                                    mt: 1,
                                    flexWrap: "nowrap",
                                }}
                            >
                                <TextField
                                    size="small"
                                    label="Enter Budget Amount"
                                    value={budgetAmount}
                                    onChange={(e) => setbudgetAmount(e.target.value)}
                                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                                    fullWidth={isXs}
                                    // sx={{ flex: { xs: "none", sm: 1 } }}
                                    sx={{
                                        // half width on all breakpoints
                                        width: "50%",
                                        mt: 1.5

                                    }}
                                />

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexShrink: 0,
                                        mt: 1.5

                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        onClick={handleSetBudget}
                                        //  disabled={budgetAmount.trim() === ""}
                                        fullWidth={isXs}
                                        sx={{ minWidth: 80 }}
                                        size="small"
                                    >
                                        Set
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => {
                                            setShowAddInput(false);
                                        }}
                                        fullWidth={isXs}
                                        size="small"
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        )}


                        {/* Title / current numbers */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 1,
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                                   This Month Currently Spend
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                                    {`Rs.${userTotalAmount}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                                    {`of Rs.${budgetAmount}`}
                                </Typography>
                            </Box>

                        </Box>



                        {/* Progress bar */}
                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 0.5,
                                    flexDirection: { xs: "row", sm: "row" },
                                }}
                            >
                                <Typography variant="caption">{Math.round(percent)}%</Typography>

                                {/* On small screens, keep the status text smaller and move below if cramped */}
                                <Typography
                                    variant="caption"
                                    color={exceeded ? "error.main" : "text.secondary"}
                                    sx={{ display: { xs: "none", sm: "block" } }}
                                >
                                    {exceeded ? "Limit reached" : "Within limit"}
                                </Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={percent}
                                sx={{
                                    height: isXs ? 2 : 4,
                                    borderRadius: 2,
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === "light"
                                            ? "rgba(0,0,0,0.08)"
                                            : "rgba(255,255,255,0.08)",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 2,
                                        backgroundColor: exceeded
                                            ? (theme) => theme.palette.error.main
                                            : (theme) => theme.palette.success.main,
                                    },
                                }}
                                aria-label="progress toward limit"
                            />
                        </Box>

                        {/* status text for xs (so mobile users still see it) */}
                        {isXs && (
                            <Typography variant="caption" color={exceeded ? "error.main" : "text.secondary"}>
                                {exceeded ? "Limit reached" : "Within limit"}
                            </Typography>
                        )}

                        {/* Alert when exceeded */}
                        {exceeded && (
                            <Alert severity="error" variant="filled">
                                Currently Spend ({userTotalAmount}) exceeds the limit ({budgetAmount}).
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    width: '100%',

                }}
            >

                <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1, height: { xs: 'auto', md: '70vh' } }}>
                    <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                        {/* First-box content */}
                        <Typography variant="h5" gutterBottom>Recent Transactions</Typography>
                        {
                            recentTransactions.length > 0 ? (

                                <List>
                                    {recentTransactions.map((item, index) => (
                                        <ListItem
                                            key={item.id || index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                borderBottom: '1px solid #ccc',
                                                py: 1,
                                            }}
                                        >
                                            <ListItemText
                                                primary={item.category && item.transactionDescription}

                                                secondary={dayjs(item.transactionDate).format("DD MMM YYYY")}
                                            />
                                            <Typography
                                                variant="body1"
                                                sx={{ color: item.transactionType.toLowerCase() === "expense" ? "red" : "green", fontWeight: 'bold' }}
                                            >
                                                {/* ₹{item.amount} */}
                                                Rs.{item.amount}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            ) :

                                <Typography
                                    variant="body1"
                                >
                                    Not Available! Make Some Transactions to See Recent Transactions
                                </Typography>



                        }



                    </Paper>
                </Box>


                <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1, height: { xs: '70vh', md: '70vh' } }}>
                    <Paper
                        elevation={3}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            p: 2
                        }}
                    >

                        {/* Second box content */}
                        {/* Tabs */}
                        <Tabs
                            value={transactionMode}
                            onChange={(e, newValue) => setTransactionMode(newValue)}
                            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab label="Expenses" value="expense" />
                            <Tab label="Income" value="income" />
                        </Tabs>

                        {/* Dropdown Filter */}
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                // value={dateFilter}
                                value={transactionMode === "expense" ? filterExpenses : filterIncomes}
                                label="Date Range"
                                // onChange={(e) => setDateFilter(e.target.value)}
                                onChange={(e) => transactionMode === "expense" ? setFilterExpenses(e.target.value) : setFilterIncomes(e.target.value)}
                            >
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="thisWeek">This Week</MenuItem>
                                <MenuItem value="thisMonth">This Month</MenuItem>
                                <MenuItem value="last6Months">Last 6 Months</MenuItem>
                                <MenuItem value="lastYear">Last Year</MenuItem>
                                <MenuItem value="last5Years">Last 5 Years</MenuItem>
                                <MenuItem value="all">All</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Chart */}
                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            {chdata.length > 0 ? (
                                <Doughnut
                                    data={chartData}
                                    options={options}
                                />
                            ) : (
                                <Typography
                                    variant="body1"
                                >
                                    Not Available! Make Transactions {transactionMode === "expense" ? filterExpenses : filterIncomes} to View Chart
                                </Typography>
                            )
                            }
                        </Box>

                    </Paper>
                </Box>



            </Box>

            <Box sx={{ width: { xs: '100%', md: '100%' }, p: 1 }}>
                <Paper
                    elevation={3}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ marginBottom: 2 }}>Incomes and Expenses Overview</Typography>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={filterBarChart}
                            label="Date Range"
                            onChange={(e) => setFilterBarChart(e.target.value)}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="thisMonth">This Month</MenuItem>
                            <MenuItem value="last6Months">Last 6 Months</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1, height: 500 }}>
                        {filtered.length > 0 ? (
                            <Bar data={barData} options={barOptions} />
                        ) : (
                            <Typography
                                variant="body1"
                            >
                                Not Available! Make Transactions {filterBarChart} to View Chart
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>





        </>



    );
}





