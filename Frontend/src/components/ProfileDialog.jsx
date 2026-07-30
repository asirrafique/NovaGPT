import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Avatar,
    Button,
    Typography,
    Box,
    Divider,
} from "@mui/material";

import { useContext, useEffect, useState } from "react";
import { MyContext } from "../MyContext";
import { updateProfile } from "../services/profileService";
import toast from "react-hot-toast";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

function ProfileDialog({
    open,
    onClose,
}) {

    const { user, setUser, token, } = useContext(MyContext);

    const [name, setName] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

   const [saving, setSaving] = useState(false);

const handleSave = async () => {
    try {
        setSaving(true);

        const res = await updateProfile(token, {
            name,
        });

        setUser(res.data.user);

        toast.success("Profile updated successfully!");

        onClose();
    } catch (err) {
        console.error(err);

        toast.error(
            err.response?.data?.message || "Failed to update profile."
        );
    } finally {
        setSaving(false);
    }
};

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
        paper: {
            sx: {
                bgcolor: "var(--card)",
            color: "var(--text)",
            borderRadius: "18px",
            border: "1px solid var(--border)",
            },
        },
    }}
        >
            <DialogTitle
    sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--text)",
    py: 2,
    borderBottom: "1px solid var(--border)",
}}
>
    <PersonOutlineRoundedIcon sx={{ color: "#6366F1" }} />
    My Profile
</DialogTitle>

            <DialogContent>

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    mb={3}
                >

<Divider sx={{ mb: 1 }} />

                    <Avatar
                        sx={{
                            width: 70,
                            height: 70,
                            fontSize: 36,
                            bgcolor: "#5B5DF5",
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography
                        mt={2}
                        variant="h6"
                    >
                        {user?.name}
                    </Typography>

                    <Typography
                        sx={{
    color: "var(--text-secondary)",
}}
                    >
                        {user?.email}
                    </Typography>


                </Box>

                <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    margin="normal"
                    sx={{
    "& .MuiOutlinedInput-root": {
    color: "var(--text)",
    "& fieldset": {
        borderColor: "var(--border)",
    },
    "&:hover fieldset": {
        borderColor: "var(--text-secondary)",
    },
    "&.Mui-focused fieldset": {
        borderColor: "#6366F1",
    },
},

"& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
},

"& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--text)",
},
}}
                />

                <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ""}
                    disabled
                    margin="normal"

                    sx={{
                        mt: 1.2,
    "& .MuiOutlinedInput-root": {
    color: "var(--text)",
    "& fieldset": {
        borderColor: "var(--border)",
    },
    "&:hover fieldset": {
        borderColor: "var(--text-secondary)",
    },
    "&.Mui-focused fieldset": {
        borderColor: "#6366F1",
    },
},

"& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
},

"& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--text)",
},
}}
                />

                <TextField
                    fullWidth
                    label="Plan"
                    value={user?.plan || "Free"}
                    disabled
                    margin="normal"

                    sx={{
                        mt: 1.2,
    "& .MuiOutlinedInput-root": {
    color: "var(--text)",
    "& fieldset": {
        borderColor: "var(--border)",
    },
    "&:hover fieldset": {
        borderColor: "var(--text-secondary)",
    },
    "&.Mui-focused fieldset": {
        borderColor: "#6366F1",
    },
},

"& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
},

"& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--text)",
},
}}
                />

                <Button
    variant="contained"
    fullWidth
    disabled={saving}
    sx={{
        mt: 2,
        height: 48,
        borderRadius: 3,
    }}
    onClick={handleSave}
>
    {saving ? "Saving..." : "Save Changes"}
</Button>

            </DialogContent>
        </Dialog>
    );
}

export default ProfileDialog;