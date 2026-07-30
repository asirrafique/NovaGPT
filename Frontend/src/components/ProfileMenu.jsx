import { Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

function ProfileMenu({
    anchorEl,
    open,
    onClose,
    onProfile,
    onSettings,
    onLogout,
}) {
    return (
        <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    slotProps={{
        paper: {
            sx: {
                bgcolor: "var(--card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                p: 0.5,
            },
        },
    }}
>
            <MenuItem
                onClick={() => {
                    onProfile();
                    onClose();
                }}
            >
                <ListItemIcon>
                    <PersonOutlineRoundedIcon
    sx={{
        color: "var(--text-secondary)",
        fontSize: 20,
    }}
/>
                </ListItemIcon>

                My Profile
            </MenuItem>

            <MenuItem
                onClick={() => {
                    onSettings();
                    onClose();
                }}
            >
                <ListItemIcon>
                    <SettingsOutlinedIcon
    sx={{
        color: "#bdbdbd",
        fontSize: 20,
    }}
/>
                </ListItemIcon>

                Settings
            </MenuItem>

            <Divider
    sx={{
        borderColor: "var(--border)",
        my: 0.5,
    }}
/>

            <MenuItem
                onClick={() => {
                    onLogout();
                    onClose();
                }}
                sx={{ color: "#ff6464" }}
            >
                <ListItemIcon>
                    <LogoutRoundedIcon
    sx={{
        color: "#ef4444",
        fontSize: 20,
    }}
/>
                </ListItemIcon>

                Logout
            </MenuItem>
        </Menu>
    );
}

export default ProfileMenu;