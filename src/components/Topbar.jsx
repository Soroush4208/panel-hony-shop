import { Logout, Search, Menu, AccountCircle } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu as MuiMenu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Divider,
  Button
} from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/": "داشبورد",
  "/products": "مدیریت محصولات",
  "/inventory": "موجودی انبار",
  "/orders": "سفارش‌ها",
  "/blogs": "مقالات بلاگ",
  "/users": "مدیریت کاربران",
  "/ads": "تبلیغات",
  "/reviews": "نظرات",
  "/banners": "بنرها",
  "/brands": "برندها",
  "/deals": "آفرها",
  "/contact-messages": "پیام‌های تماس"
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        position: "relative",
        width: "100%"
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" }, minHeight: { xs: 64, md: 64 } }}>
        <IconButton
          color="inherit"
          sx={{ display: { xs: "flex", md: "none" }, mr: { xs: 1 } }}
          onClick={onMenuClick}
          edge="start"
        >
          <Menu />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            خوش آمدید
          </Typography>
          <Typography 
            variant="h5" 
            fontWeight={700}
            sx={{ 
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {titles[pathname] || "داشبورد"}
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="جستجو..."
          sx={{ 
            maxWidth: { xs: "100%", sm: 250, md: 300 },
            width: { xs: "100%", sm: "auto" },
            display: { xs: "none", md: "flex" },
            order: { xs: 3, md: 0 }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { opacity: 0.8 }
            }}
            onClick={handleClick}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
              {user?.name?.[0] || "A"}
            </Avatar>
            <Box sx={{ textAlign: "right", display: { xs: "none", lg: "block" } }}>
              <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                {user?.name || "کاربر"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === "admin" ? "مدیر سیستم" : user?.role}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            size="small"
            sx={{ 
              display: { xs: "none", lg: "inline-flex" },
              fontSize: { xs: "0.75rem", md: "0.875rem" }
            }}
          >
            خروج
          </Button>
          <IconButton
            color="error"
            onClick={handleLogout}
            sx={{ display: { xs: "flex", lg: "none" } }}
          >
            <Logout />
          </IconButton>
          <MuiMenu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left"
            }}
          >
            <MenuItem onClick={() => { handleClose(); navigate("/"); }}>
              <AccountCircle sx={{ mr: 1 }} />
              پروفایل
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              خروج
            </MenuItem>
          </MuiMenu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired
};

