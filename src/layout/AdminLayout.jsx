import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const drawerWidth = 260;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", width: "100%", overflow: "hidden" }}>
      <Sidebar width={drawerWidth} mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          display: "flex", 
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden"
        }}
      >
        <Topbar onMenuClick={handleDrawerToggle} />
        <Box 
          component="section" 
          sx={{ 
            flex: 1, 
            p: { xs: 2, md: 4 }, 
            width: "100%",
            overflow: "auto"
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

