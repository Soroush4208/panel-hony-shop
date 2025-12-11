import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const defaultValues = {
  email: "",
  password: ""
};

export default function LoginPage() {
  const [values, setValues] = useState(defaultValues);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "ورود ناموفق بود");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#fef3c7,#fde68a)"
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", borderRadius: 4, boxShadow: 8 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={1}>
            ورود به پنل مدیریت
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            لطفاً ایمیل و رمز عبور ادمین را وارد کنید.
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="ایمیل"
                name="email"
                value={values.email}
                onChange={handleChange}
                type="email"
                required
                fullWidth
              />
              <TextField
                label="رمز عبور"
                name="password"
                value={values.password}
                onChange={handleChange}
                type="password"
                required
                fullWidth
              />
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                ورود
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

