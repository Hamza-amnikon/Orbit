import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, IconButton, List, ListItem, ListItemText, Paper, Stack, TextField, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const staffingApi = `${String(import.meta.env.VITE_EMPLOYEE_API_BASE_URL || "").replace(/\/+$/, "")}/api/employee/staffing`;
const errorText = (error) => error.response?.data?.message || "Unable to update the skills workspace. Please try again.";
const fieldSx = {
    "& .MuiOutlinedInput-root": { height: 42 },
    "& .MuiOutlinedInput-input": { boxSizing: "border-box", height: "100%", padding: "9px 14px" },
    // The MUI fieldset already shows keyboard focus on the rounded control.
    "&& .MuiOutlinedInput-input:focus-visible": { outline: "none" },
};

export default function ProfileSkills() {
    const [data, setData] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [error, setError] = useState("");
    const [skillName, setSkillName] = useState("");
    const [skillQuery, setSkillQuery] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [projectError, setProjectError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        axios.get(staffingApi, { signal: controller.signal })
            .then(({ data: staffing }) => setData(staffing))
            .catch((failure) => { if (!axios.isCancel(failure)) setLoadError(true); });
        return () => controller.abort();
    }, [loadAttempt]);

    async function save(request, update, onError = setError) {
        if (busy) return;
        setBusy(true);
        setError("");
        onError("");
        try {
            await request();
            update?.();
            try {
                const response = await axios.get(staffingApi);
                setData(response.data);
            } catch {
                setError("The change was saved. Refresh this tab to see the latest list.");
            }
        } catch (failure) {
            onError(errorText(failure));
        } finally {
            setBusy(false);
        }
    }

    const openAssignment = (employee) => {
        setProjectName("");
        setProjectError("");
        setSelectedEmployee(employee);
    };

    const search = skillQuery.trim().toLowerCase();
    const matchingReports = (data?.directReports ?? []).filter(employee =>
        !search || employee.skills.some(skill => skill.toLowerCase().includes(search)));

    return (
        <Paper component="section" className="profile-skills-panel" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography component="h2" variant="h6">Skills</Typography>
                    <Typography color="text.secondary" variant="body2">Add the skills you can use on projects.</Typography>
                </Box>
                {loadError && (
                    <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => {
                        setLoadError(false);
                        setLoadAttempt(attempt => attempt + 1);
                    }}>Retry</Button>}>Unable to load skills and projects.</Alert>
                )}
                {!data && !loadError && <CircularProgress size={24} aria-label="Loading skills" />}
                {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
                {data && <>
                    <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={1.5}
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!skillName.trim()) return;
                            save(() => axios.post(`${staffingApi}/skills`, { name: skillName.trim() }), () => setSkillName(""));
                        }}>
                        <TextField size="small" label="Skill name" value={skillName}
                            onChange={(event) => setSkillName(event.target.value)}
                            slotProps={{ htmlInput: { maxLength: 80 } }} sx={fieldSx} fullWidth disabled={busy} />
                        <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />}
                            disabled={busy || !skillName.trim()} sx={{ flexShrink: 0, minHeight: 42 }}>Add skill</Button>
                    </Stack>
                    {data.skills.length ? (
                        <List disablePadding aria-label="My skills" sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
                            {data.skills.map((skill, index) => (
                                <ListItem key={skill} divider={index < data.skills.length - 1} secondaryAction={
                                    <IconButton aria-label={`Remove ${skill}`} size="small" disabled={busy}
                                        onClick={() => save(() => axios.delete(`${staffingApi}/skills`, { params: { name: skill } }))}>
                                        <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                }>
                                    <ListItemText primary={skill} sx={{ overflowWrap: "anywhere" }} />
                                </ListItem>
                            ))}
                        </List>
                    ) : <Typography variant="body2" color="text.secondary">No skills added yet.</Typography>}

                    {data.directReports.length > 0 && <>
                        <Divider />
                        <Box>
                            <Typography component="h3" variant="subtitle1" fontWeight={700}>Team staffing</Typography>
                            <Typography variant="body2" color="text.secondary">Find people on your team by skill and assign them to a project.</Typography>
                        </Box>
                        <TextField size="small" label="Filter team by skill" value={skillQuery}
                            onChange={(event) => setSkillQuery(event.target.value)} sx={{ ...fieldSx, maxWidth: 360 }} />
                        {!matchingReports.length && <Typography variant="body2" color="text.secondary">No team members match that skill.</Typography>}
                        {matchingReports.map(employee => (
                            <Paper key={employee.employeeId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ sm: "center" }}>
                                        <Box>
                                            <Typography fontWeight={700}>{employee.name || `Employee ${employee.employeeId}`}</Typography>
                                            {employee.designation && <Typography variant="body2" color="text.secondary">{employee.designation}</Typography>}
                                        </Box>
                                        <Button variant="outlined" onClick={() => openAssignment(employee)} disabled={busy}>Assign to project</Button>
                                    </Stack>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {employee.skills.length ? employee.skills.map(skill => <Chip key={skill} label={skill} size="small" />) :
                                            <Typography variant="body2" color="text.secondary">No skills listed.</Typography>}
                                    </Stack>
                                    {employee.projects.length > 0 && (
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                                            <Typography variant="body2" color="text.secondary">Projects</Typography>
                                            {employee.projects.map(project => <Chip key={project.projectName} label={project.projectName} size="small"
                                                variant="outlined" disabled={busy} onDelete={() => save(() => axios.delete(
                                                    `${staffingApi}/team/${employee.employeeId}/projects`, { params: { name: project.projectName } }))} />)}
                                        </Stack>
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </>}
                </>}
            </Stack>

            <Dialog className="profile-project-dialog" open={Boolean(selectedEmployee)} onClose={() => !busy && setSelectedEmployee(null)} fullWidth maxWidth="xs">
                <Box component="form" onSubmit={(event) => {
                    event.preventDefault();
                    if (!selectedEmployee || !projectName.trim()) return;
                    save(() => axios.post(`${staffingApi}/team/${selectedEmployee.employeeId}/projects`, {
                        projectName: projectName.trim(),
                    }), () => setSelectedEmployee(null), setProjectError);
                }}>
                    <DialogTitle>Assign to project</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedEmployee?.name}</Typography>
                        {projectError && <Alert severity="error" sx={{ mb: 2 }}>{projectError}</Alert>}
                        <TextField size="small" label="Project name" value={projectName} onChange={(event) => setProjectName(event.target.value)}
                            autoFocus fullWidth disabled={busy} sx={fieldSx} slotProps={{ htmlInput: { maxLength: 120 } }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedEmployee(null)} disabled={busy}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={busy || !projectName.trim()}>Assign</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Paper>
    );
}
