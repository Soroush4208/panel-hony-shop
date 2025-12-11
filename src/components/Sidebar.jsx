import {
  Dashboard,
  Inventory2,
  LibraryBooks,
  LocalShipping,
  People,
  ProductionQuantityLimits,
  Campaign,
  RateReview,
  Email,
  PhotoSizeSelectLarge,
  Loyalty,
  LocalOffer,
  SettingsInputComponent
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const navItems = [
  { label: "داشبورد", icon: Dashboard, path: "/" },
  { label: "محصولات", icon: ProductionQuantityLimits, path: "/products" },
  { label: "موجودی", icon: Inventory2, path: "/inventory" },
  { label: "سفارش‌ها", icon: LocalShipping, path: "/orders" },
  { label: "بلاگ", icon: LibraryBooks, path: "/blogs" },
  { label: "دسته‌بندی‌ها", icon: SettingsInputComponent, path: "/categories" },
  { label: "کاربران", icon: People, path: "/users" },
  { label: "تبلیغات", icon: Campaign, path: "/ads" },
  { label: "نظرات", icon: RateReview, path: "/reviews" },
  { label: "بنرها", icon: PhotoSizeSelectLarge, path: "/banners" },
  { label: "برندها", icon: Loyalty, path: "/brands" },
  { label: "آفرها", icon: LocalOffer, path: "/deals" },
  { label: "پیام‌های تماس", icon: Email, path: "/contact-messages" }
];

export default function Sidebar({ width, mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const drawerContent = (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          عسلستان
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          پنل مدیریت فروشگاه عسل
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon || SettingsInputComponent;
          const active = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) {
                  onDrawerToggle();
                }
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: active ? "#fbbf24" : "inherit",
                backgroundColor: active ? "rgba(251,191,36,0.1)" : "transparent"
              }}
            >
              <ListItemIcon sx={{ color: active ? "#fbbf24" : "#fff" }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: {
            width,
            boxSizing: "border-box",
            background: "linear-gradient(180deg,#1f2937,#111827)",
            color: "#fff"
          }
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width,
            boxSizing: "border-box",
            background: "linear-gradient(180deg,#1f2937,#111827)",
            color: "#fff",
            position: "relative",
            height: "100%",
            borderRight: "none"
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

Sidebar.propTypes = {
  width: PropTypes.number.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  onDrawerToggle: PropTypes.func.isRequired
};

