import React from "react";
import { Box, Button } from "@mui/material";

interface MarvToolBoxButtonsProps {
  onButtonClick: (action: string) => void;
}

export default function MarvToolBoxButtons({
  onButtonClick,
}: MarvToolBoxButtonsProps) {
  const buttons = [
    {
      text: "Create Backup",
      prompt: "Please create logic and calculation stash",
    },
    {
      text: "Restore Backup",
      prompt: "Please restore logic and calculation stash",
    },
    {
      text: "Make Labels Unique",
      prompt: "Please add unique slug to the beginning of each label",
    },
    {
      text: "Remove Unique Slugs",
      prompt: "Please remove label unique slugs",
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {buttons.map((button) => (
        <Button
          key={button.text}
          variant="outlined"
          fullWidth
          onClick={() => onButtonClick(button.prompt)}
          sx={{
            mb: 1,
            justifyContent: "flex-start",
            textAlign: "left",
            height: "auto",
            whiteSpace: "normal",
            py: 1,
          }}
        >
          {button.text}
        </Button>
      ))}
    </Box>
  );
}
