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
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  SwapHoriz,
  Notifications,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import NotificationList from "./NotificationList";

export default function TopBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowNotifications(false);
  };

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
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
            backgroundColor: "grey.300",
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
          onClick={handleMenu}
        >
          <Typography
            variant="body1"
            sx={{ ml: 1, mr: 0.5, display: { xs: "none", sm: "block" } }}
          >
            John Doe
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
              }}
            >
              JD
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SwapHoriz fontSize="small" />
            </ListItemIcon>
            <ListItemText>Switch Form Context</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleNotificationsToggle}>
            <ListItemIcon>
              <Notifications fontSize="small" />
            </ListItemIcon>
            <ListItemText>Notifications</ListItemText>
            {showNotifications ? <ExpandLess /> : <ExpandMore />}
          </MenuItem>
          <Collapse in={showNotifications} timeout="auto" unmountOnExit>
            <Box
              sx={{
                maxHeight: "50vh",
                overflow: "auto",
                bgcolor: "background.default",
                borderTop: 1,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <NotificationList />
            </Box>
          </Collapse>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Log Out</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
