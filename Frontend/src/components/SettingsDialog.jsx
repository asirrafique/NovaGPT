import {
    Dialog,
    DialogTitle,
    DialogContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
} from "@mui/material";

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function SettingsDialog({ open, onClose }) {
    const { themeMode, setThemeMode } = useContext(ThemeContext);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "background.paper",
                        color: "text.primary",
                        borderRadius: 3,
                        minWidth: 420,
                    },
                },
            }}
        >
            <DialogTitle>Settings</DialogTitle>

            <DialogContent>
                <Typography
                    sx={{
                        mb: 2,
                        fontWeight: 600,
                    }}
                >
                    Appearance
                </Typography>

                <RadioGroup
                    value={themeMode}
                    onChange={(e) =>
                        setThemeMode(e.target.value)
                    }
                >
                    <FormControlLabel
                        value="light"
                        control={<Radio />}
                        label="☀️ Light"
                    />

                    <FormControlLabel
                        value="dark"
                        control={<Radio />}
                        label="🌙 Dark"
                    />

                    <FormControlLabel
                        value="system"
                        control={<Radio />}
                        label="💻 System"
                    />
                </RadioGroup>
            </DialogContent>
        </Dialog>
    );
}

export default SettingsDialog;