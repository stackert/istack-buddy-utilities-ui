import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import {
  ViewModule as ViewModuleIcon,
  Public as PublicIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setViewMode } from "@/store/slices/appSlice";

const drawerWidth = 240;

const AppNavigation: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formId, securityToken } = useAppSelector((state) => state.app);

  const handleMarvClick = () => {
    if (formId && securityToken) {
      dispatch(setViewMode("form-marv"));
      router.push("/public/form-marv/demo-token/demo-form-id");
    }
  };

  const handleHelloWorldClick = () => {
    router.push("/app/hello-world");
  };

  const handleExitClick = () => {
    // In a real app, this might clear session, logout, etc.
    router.push("/");
  };

  const navItems = [
    // Marv - only show if we have form data
    ...(formId
      ? [
          {
            label: "Marv",
            icon: <ViewModuleIcon />,
            onClick: handleMarvClick,
            visible: true,
          },
        ]
      : []),

    {
      label: "Hello World",
      icon: <PublicIcon />,
      onClick: handleHelloWorldClick,
      visible: true,
    },
    {
      label: "Exit",
      icon: <ExitToAppIcon />,
      onClick: handleExitClick,
      visible: true,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          position: "relative",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          iStack Buddy
        </Typography>
      </Toolbar>
      <Divider />

      <List>
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={item.onClick}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default AppNavigation;
