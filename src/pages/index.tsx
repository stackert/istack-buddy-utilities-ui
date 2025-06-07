import { Typography, Container, Box } from "@mui/material";
import Navigation from "../components/Navigation";

export default function Home() {
  return (
    <Navigation>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to the Home Page
          </Typography>
        </Box>
      </Container>
    </Navigation>
  );
}
