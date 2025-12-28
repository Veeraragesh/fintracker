import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Link,
    Grid,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import API from './api';
import { useSnackbar } from "./snackbarcontext";




export default function SignUp({ onSwitchToSignIn, onSignupSuccess }) {
    const navigate = useNavigate();

    const [name,setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
      const { showSnackbar } = useSnackbar();
    

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name) newErrors.name = "Name is required";
        if (!email) newErrors.email = "Email is required";
        else if (!validateEmail(email)) newErrors.email = "Invalid email format";
        if (!password) newErrors.password = "Password is required";
        if (!confirm) newErrors.confirm = "Please confirm password";
        else if (confirm !== password)
            newErrors.confirm = "Passwords do not match";
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {


            const payload = {
                name:name,
                email: email,
                password: confirm

            }

            console.log("signup payload...",payload)
            try {
                const response = await API.post("/signup", payload);
                console.log("Backend response:", response.data);
                if (response.data.status === 1) {
                    showSnackbar("Signup Successful!", "success")
                   onSwitchToSignIn();                    

                } else {
                    showSnackbar("Can't login Something Went Wrong", "error");
                }

            } catch (error) {
                console.error("Error sending data:", error);
            }

        }

    };

    console.log("type of", typeof (onSignupSuccess))

    return (
        <Card elevation={3} sx={{ width: "100%", maxWidth: 480 }}>
            <CardContent sx={{ px: 4, py: 5 }}>
                <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 2 }}>
                    Create Account
                </Typography>

                <form noValidate onSubmit={handleSubmit}>
                    <Grid container justifyContent="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Already have an account?
                        </Typography>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={onSwitchToSignIn}
                            underline="hover"
                            sx={{ fontWeight: 600 }}
                        >
                            Sign in
                        </Link>
                    </Grid>

                    <TextField
                        label="Name"
                        required
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        label="Email address"
                        required
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        label="Password"
                        required
                        fullWidth
                        margin="normal"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Confirm password"
                        required
                        fullWidth
                        margin="normal"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        error={!!errors.confirm}
                        helperText={errors.confirm}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirm((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                        Create Account
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
