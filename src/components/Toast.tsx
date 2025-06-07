import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert, AlertTitle, Box } from "@mui/material";
import { RootState } from "../store/store";
import { removeToast } from "../store/notificationSlice";
import { LogLevel } from "../services/logger";
import { logger, ELoggerTags } from "../services/logger";

const AUTO_HIDE_DURATION = 5000; // 5 seconds
const TOAST_SPACING = 16; // pixels between toasts

export default function Toast() {
  const dispatch = useDispatch();
  const activeToasts = useSelector(
    (state: RootState) => state.notifications.activeToasts
  );

  useEffect(() => {
    activeToasts.forEach((toast) => {
      logger.debug(
        `Toast notification received: ${toast.title}`,
        ELoggerTags.DEV_DEBUG,
        "toast-component"
      );

      const timer = setTimeout(() => {
        logger.debug(
          `Auto-dismissing toast notification: ${toast.id}`,
          ELoggerTags.DEV_DEBUG,
          "toast-component"
        );
        dispatch(removeToast(toast.id));
      }, AUTO_HIDE_DURATION);

      return () => clearTimeout(timer);
    });
  }, [activeToasts, dispatch]);

  const handleClose = (id: string) => {
    logger.debug(
      `Manually dismissing toast notification: ${id}`,
      ELoggerTags.DEV_DEBUG,
      "toast-component"
    );
    dispatch(removeToast(id));
  };

  const getSeverity = (
    level: LogLevel
  ): "error" | "warning" | "info" | "success" => {
    switch (level) {
      case "error":
        return "error";
      case "warn":
        return "warning";
      case "info":
        return "info";
      case "debug":
        return "success";
      default:
        return "info";
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: `${TOAST_SPACING}px`,
        padding: `${TOAST_SPACING}px`,
      }}
    >
      {activeToasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            position: "relative",
            transform: "none",
            top: "auto",
            right: "auto",
            "& .MuiSnackbar-root": {
              position: "relative",
            },
          }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={getSeverity(toast.level)}
            variant="filled"
            sx={{
              width: "100%",
              minWidth: "300px",
              boxShadow: 3,
              animation: "slideIn 0.3s ease-out",
              "@keyframes slideIn": {
                "0%": {
                  transform: "translateX(100%)",
                  opacity: 0,
                },
                "100%": {
                  transform: "translateX(0)",
                  opacity: 1,
                },
              },
              "&:hover": {
                transform: "translateX(-4px)",
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
