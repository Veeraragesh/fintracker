import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItemButton,
    Tooltip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from "./themecontext";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "./snackbarcontext";


import SearchableDataGrid from "./transactiontable";
import BudgetComponent from "./budgetcomponent";

import { useNavigate } from "react-router-dom";


export default function Navbar() {
    const { mode, toggleColorMode } = useColorMode();
    const [darkMode, setDarkMode] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [moduleNo, setModuleNo] = useState();
    const navigate = useNavigate();
    const location = useLocation();
    const name = location.state?.name;
    const { showSnackbar } = useSnackbar();
    

    const theme = useTheme();

    const navItems = [
        { text: "Dashboard", path: "/dashboard" },
        { text: "Your Transactions", path: "/managetransaction" }
    ];

    const toggleDrawer = (open) => () => setDrawerOpen(open);
    const toggleDialog = () => setDialogOpen(!dialogOpen);
    const toggleTheme = () => setDarkMode(!darkMode);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        showSnackbar("Logged Out Successfully","success");
}

    console.log("moduleno: ", moduleNo)

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
                    color: mode === "dark" ? "#ffffff" : "#000000",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
                    margin: 0,
                }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    {/* Left side - title */}


                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 1000,
                            background: "linear-gradient(90deg, #2196f3, #21cbf3)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            // letterSpacing: 1.5,
                            //  textTransform: "uppercase",
                            //  fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        FinTracker
                    </Typography>


                    {/* Desktop Menu */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.text}
                                // component={Link}
                                // to={item.path}
                                // sx={{
                                //     color: "inherit",
                                //     mx: 1,
                                //     fontSize: "20px",
                                //     textTransform: "none",
                                // }}
                                sx={{
                                    color: "inherit",
                                    mx: 1,
                                    fontSize: "19px",
                                    textTransform: "none",
                                    fontWeight: 500,

                                }}
                                onClick={() => item.text === "Your Transactions" ? setModuleNo(2) : item.text === "Dashboard" ? setModuleNo(1) : setModuleNo(3)}
                            >

                                {item.text}
                            </Button>
                        ))}


                        {/* Dark / Light Mode Toggle */}
                        <Tooltip title={mode === "dark" ? "Switch Light Mode" : "Switch Dark Mode"}>
                            <IconButton color="inherit" onClick={toggleColorMode}>
                                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>


                        <Tooltip title="Logout">
                            {/* User Icon */}
                            <IconButton color="inherit" onClick={toggleDialog}>
                                < LogoutIcon />
                            </IconButton>
                        </Tooltip>

                        <Typography variant="h6" align="center" sx={{ color: "#2196f3", ml: 1, mr: 1 }}>{name}</Typography>


                    </Box>

                    {/* Mobile Menu */}
                    <Box sx={{ display: { xs: "flex", md: "none" } }}>
                        <IconButton color="inherit" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>


                    </Box>
                </Toolbar>
            </AppBar>



            {/* Drawer for small screens */}
            < Drawer
                anchor="right"
                PaperProps={{
                    sx: {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        width: 250,
                        transition: "background-color 0.3s ease, color 0.3s ease", // smooth
                    },
                }
                }
                open={drawerOpen}
                onClose={toggleDrawer(false)} >
                <Box
                    sx={{ width: 250, height: "100%" }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                >
                    <ListItem>
                        <Typography variant="h6" align="center" sx={{ color: "#2196f3" }}>{name}</Typography>
                    </ListItem>

                    <List>
                        {navItems.map((item) => (
                            <ListItemButton
                                key={item.text}
                                // component={Link}
                                // to={item.path}
                                sx={{
                                    color: "inherit",
                                    mx: 1,
                                    fontSize: "17px",
                                    textTransform: "none",
                                }}
                                onClick={() => item.text === "Your Transactions" ? setModuleNo(2) : item.text === "Dashboard" ? setModuleNo(1) : setModuleNo(3)}
                            >

                                {item.text}
                            </ListItemButton>
                        ))}

                        <ListItem button onClick={toggleColorMode}>
                            <ListItemText primary={mode === "dark" ? "Light Mode" : "Dark Mode"} />
                            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                        </ListItem>


                        <ListItem button onClick={toggleDialog}>
                            <LogoutIcon sx={{ mr: 1 }} />
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer >

            {/* Dialog box for user icon */}
            < Dialog open={dialogOpen} onClose={toggleDialog} >
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to logout?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleLogout}>Yes</Button>
                </DialogActions>
            </Dialog >




            {
                moduleNo === 2 ? <SearchableDataGrid /> : <BudgetComponent />
            }

        </>
    );
}