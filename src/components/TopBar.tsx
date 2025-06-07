import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function TopBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logout clicked");
    handleClose();
  };

  const handleSwitchContext = () => {
    // TODO: Implement context switching functionality
    console.log("Switch context clicked");
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Logo placeholder */}
        <Box
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 1,
            mr: 2,
          }}
        />

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          iStack Buddy
        </Typography>

        {/* User section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={handleClick}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "secondary.main",
            }}
          >
            U
          </Avatar>
          <Typography
            variant="body1"
            sx={{ ml: 1, mr: 0.5, display: { xs: "none", sm: "block" } }}
          >
            User Name
          </Typography>
          <KeyboardArrowDownIcon />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleSwitchContext}>Switch Form Context</MenuItem>
          <MenuItem onClick={handleLogout}>Log Out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
