import { TextField, Button, Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import Navigation from "../components/Navigation";

export default function HelloWorld() {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with value:", inputValue);
  };

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
            Hello World!
          </Typography>

          <Box
            component="form"
            role="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Enter your text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              variant="outlined"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </Navigation>
  );
}
