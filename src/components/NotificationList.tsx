import { useDispatch, useSelector } from "react-redux";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { RootState } from "../store/store";
import {
  dismissNotification,
  clearAllNotifications,
} from "../store/notificationSlice";

export default function NotificationList() {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const getColor = (level: string) => {
    switch (level) {
      case "error":
        return "error.main";
      case "warn":
        return "warning.main";
      case "info":
        return "info.main";
      case "debug":
        return "grey.500";
      default:
        return "grey.500";
    }
  };

  if (notifications.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No notifications
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Notifications</Typography>
        <IconButton
          onClick={() => dispatch(clearAllNotifications())}
          size="small"
          color="error"
          data-testid="clear-all-button"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => dispatch(dismissNotification(notification.id))}
              >
                <DeleteIcon />
              </IconButton>
            }
            sx={{
              borderLeft: 4,
              borderColor: getColor(notification.level),
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  {notification.title}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    {notification.message}
                  </Typography>
                  {notification.moreInfo && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {notification.moreInfo}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
