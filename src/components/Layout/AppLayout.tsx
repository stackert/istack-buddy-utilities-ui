import React from "react";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Chip,
  Button,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  AccountCircle,
  ViewModule,
  Web,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";
import { setViewMode } from "@/store/slices/appSlice";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { mode } = useAppSelector((state) => state.theme);
  const { user, viewMode, isDevelopmentMode } = useAppSelector(
    (state) => state.app
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleViewModeToggle = () => {
    if (viewMode === "form-marv") {
      dispatch(setViewMode("app"));
      router.push("/app");
    } else {
      dispatch(setViewMode("form-marv"));
      router.push("/public/form-marv/demo-token/demo-form-id");
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            {viewMode === "form-marv" ? (
              <Box>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ lineHeight: 1.2, mb: 0 }}
                >
                  Marv
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontSize: "0.75rem",
                    lineHeight: 1,
                    opacity: 0.8,
                    fontStyle: "italic",
                    mt: -0.5,
                  }}
                >
                  (iStackBuddy)
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" component="div">
                iStack Buddy
              </Typography>
            )}
          </Box>

          {/* Development Mode View Switcher */}
          {isDevelopmentMode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={viewMode === "form-marv" ? <Web /> : <ViewModule />}
              onClick={handleViewModeToggle}
              sx={{
                mr: 2,
                color: "inherit",
                borderColor: "rgba(255,255,255,0.3)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
              }}
            >
              {viewMode === "form-marv"
                ? "Switch to App View"
                : "Switch to Form-MARV"}
            </Button>
          )}

          {/* Theme Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={mode === "dark"}
                onChange={handleThemeToggle}
                size="small"
              />
            }
            label={
              <IconButton size="small" sx={{ color: "inherit" }}>
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            }
            sx={{ mr: 1 }}
          />

          {/* User Info */}
          {user ? (
            <>
              <Chip
                icon={<AccountCircle />}
                label={`Welcome, ${user.name || user.email}`}
                variant="outlined"
                onClick={handleUserMenuOpen}
                sx={{
                  color: "inherit",
                  borderColor: "rgba(255,255,255,0.3)",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleUserMenuClose}>
                  <Typography variant="body2">
                    Logged in as: {user.email}
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Chip
              icon={<AccountCircle />}
              label="Not logged in"
              variant="outlined"
              sx={{
                color: "inherit",
                borderColor: "rgba(255,255,255,0.3)",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
