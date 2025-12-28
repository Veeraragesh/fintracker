import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Grid,
  InputAdornment,
  Snackbar,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "./snackbarcontext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import API from './api';


export default function SignIn({ onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      // alert(location.state.message);   // or toast
      console.log("msg", location.state.message)
      showSnackbar(location.state.message, "info");

    }
  }, [location.state]);



  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload = {
        email: email,
        password: password

      }
      try {
        const response = await API.post("/signin", payload);
        console.log("Backend response:", response.data);

        if (response.data.status === 1) {
          showSnackbar("Login Successful!", "success");

          const token = response.data.token;
          localStorage.setItem("token", token);

          navigate("/managetransactions", {
            state: { name: response.data.user.username }
          });

        } else {
          // this runs ONLY if backend sends status:1 but logical failure
          showSnackbar(
            response.data.detail || "Can't login. Something went wrong",
            "error"
          );
        }

      } catch (error) {
        console.error("Login error:", error);

        // 👇 THIS is where 400 / 401 errors come
        const errorMessage =
          error.response?.data?.detail || "Server error. Please try again.";

        showSnackbar(errorMessage, "error");
      }

    }
    // alert("Signed in (simulated)");

  };

  return (
    <Card elevation={3} sx={{ width: "100%", maxWidth: 480 }}>
      <CardContent sx={{ px: 4, py: 5 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 2 }}>
          Sign In
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Grid container justifyContent="center" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              New here?
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToSignUp}
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Create new account
            </Link>
          </Grid>

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

          {/* <Box sx={{ textAlign: "right", mt: 1 }}>
            <Link
              href="#"
              underline="hover"
              sx={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </Box> */}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Sign In
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
