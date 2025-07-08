import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import TopBar from "./TopBar";
import { logger, ELoggerTags } from "../services/logger";
import Toast from "./Toast";
import { addNotification } from "../store/notificationSlice";
import { LogLevel } from "../services/logger";

const DRAWER_WIDTH = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const menuItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Hello World", icon: <HomeIcon />, path: "/hello-world" },
  { text: "Chat Test", icon: <HomeIcon />, path: "/chat-test" },
  { text: "Env Test", icon: <HomeIcon />, path: "/env-test" },
  { text: "Example 1", icon: <HomeIcon />, path: "/example-1" },
];

const getRandomLogLevel = (): LogLevel => {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  return levels[Math.floor(Math.random() * levels.length)];
};

const getRandomNumber = (): number => {
  return Math.floor(Math.random() * 10000) + 1;
};

const getRandomBoolean = (): boolean => {
  return Math.random() < 0.5; // 50% chance of being true
};

export default function Navigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    const newState = !open;
    const logLevel = getRandomLogLevel();
    const randomNumber = getRandomNumber();
    const isSticky = getRandomBoolean();

    // Map LogLevel to notification level
    let notificationLevel: "info" | "error" | "success" | "warning";
    switch (logLevel) {
      case "debug":
        notificationLevel = "info";
        break;
      case "warn":
        notificationLevel = "warning";
        break;
      case "info":
      case "error":
        notificationLevel = logLevel;
        break;
      default:
        notificationLevel = "info";
    }

    // Create notification payload
    const notification = {
      title: `Navigation Update #${randomNumber}`,
      message: `Side navigation drawer ${newState ? "opened" : "closed"}`,
      level: notificationLevel,
      moreInfo: `Log level: ${logLevel}, Sticky: ${isSticky}`,
      isSticky,
    };

    // Log to console before dispatching
    logger.debug(
      `Dispatching notification for drawer ${newState ? "open" : "close"}`,
      ELoggerTags.DEV_DEBUG,
      "navigation-component"
    );

    // Dispatch notification
    dispatch(addNotification(notification));

    // Update state
    setOpen(newState);

    // Log to console after state update
    logger.debug(
      `Navigation drawer ${newState ? "opened" : "closed"}`,
      ELoggerTags.DEV_DEBUG,
      "navigation-component"
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar />
      <Toast />
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            marginTop: "64px", // Height of the AppBar
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={router.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        {children}
      </Main>
    </Box>
  );
}
