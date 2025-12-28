import React, { useState } from "react";
import {
    ThemeProvider,
    createTheme,
    Container,
    Grid,
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
} from "@mui/material";
import SignIn from "./signin";
import SignUp from "./signup";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#000000" },
        background: { default: "#ffffff", paper: "#ffffff" },
        text: { primary: "#000000", secondary: "#000000" },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    backgroundColor: "#000000",
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                    "&:hover": { backgroundColor: "#222222" },
                },
                outlined: {
                    borderColor: "#000000",
                    color: "#000000",
                    textTransform: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                },
            },
        },
    },
});

export default function SignInSignUp() {
    const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
    const [howOpen, setHowOpen] = useState(false);
    const [showFormOnSmall, setShowFormOnSmall] = useState(false);

    const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
    const isMediumOrSmaller = useMediaQuery(theme.breakpoints.down("lg"));

    //       const handleSignupSuccess = () => {
    //     // After successful signup switch back to signin
    //     setMode("signin");
    //   };
    function handleSignupSuccess() {
        setMode("signin");
        // optionally show message etc.
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                maxWidth="lg"
                sx={{ minHeight: "80vh", display: "flex", alignItems: "center", py: 6 }}
            >
                {isLarge ? (
                    <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            flexWrap: { xs: "wrap", md: "nowrap" }, // prevent wrapping on medium & larger screens
                            gap: { xs: 4, md: 6 }, // space between left and right
                        }}
                    >
                        {/* Left text */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{
                                flexShrink: 0,
                                textAlign: { xs: "center", md: "left" },
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                px: { xs: 2, md: 4 },
                            }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                                FinTracker
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Track Your Money Transactions With Ease.
                            </Typography>
                            {/* <Button
                                variant="outlined"
                                onClick={() => setHowOpen(true)}
                                sx={{ textTransform: "none", backgroundColor: "white", alignSelf: { xs: "center", md: "flex-start" } }}
                            >
                                How to use
                            </Button> */}
                        </Grid>

                        {/* Right form */}
                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{
                                display: "flex",
                                justifyContent: { xs: "center", md: "flex-start" },
                                alignItems: "center",
                            }}
                        >
                            <Box sx={{ width: "100%", maxWidth: 520 }}>
                                {mode === "signin" ? (
                                    <SignIn onSwitchToSignUp={() => setMode("signup")} />
                                ) : (
                                    <SignUp onSwitchToSignIn={() => setMode("signin")} onSignupSuccess={handleSignupSuccess} />
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                        {/* <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                            {mode === "signin" ? "Welcome back." : "Join us."}
                        </Typography> */}

                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                            FinTracker
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Track Your Money Transactions With Ease.
                        </Typography>

                        {!showFormOnSmall ? (
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setMode("signin");
                                        setShowFormOnSmall(true);
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setMode("signup");
                                        setShowFormOnSmall(true);
                                    }}
                                >
                                    Create Account
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                                <Box sx={{ width: "100%", maxWidth: 520 }}>
                                    {mode === "signin" ? (
                                        <SignIn onSwitchToSignUp={() => setMode("signup")} />
                                    ) : (
                                        <SignUp onSwitchToSignIn={() => setMode("signin")} onSignupSuccess={handleSignupSuccess} />
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* <Button
                            variant="outlined"
                            onClick={() => setHowOpen(true)}
                            sx={{ mt: 3, textTransform: "none" }}
                        >
                            How to use
                        </Button> */}
                    </Box>
                )}

                <Dialog open={howOpen} onClose={() => setHowOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>How to use</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>1. Enter your email and password to sign in.</Typography>
                        <Typography sx={{ mb: 2 }}>
                            2. If you don’t have an account, click "Create Account" to sign up.
                        </Typography>
                        <Typography>3. Follow the instructions to complete your sign up or sign in.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setHowOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
}
