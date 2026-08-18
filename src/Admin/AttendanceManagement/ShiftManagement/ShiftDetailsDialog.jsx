import {

  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Divider,
  Chip,
  Button

} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

export default function ShiftDetailsDialog({

  open,

  employee,

  onClose

}) {

  if (!employee) return null;

  return (

    <Dialog

      open={open}

      onClose={onClose}

      fullWidth

      maxWidth="md"

    >

      <DialogTitle

        sx={{

          display:"flex",

          justifyContent:"space-between",

          alignItems:"center",

          fontWeight:700

        }}

      >

        Shift Assignment Details

        <Button

          onClick={onClose}

          startIcon={<CloseIcon />}

        >

          Close

        </Button>

      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt:2 }}>

        {/* ===================================== */}

        <Typography

          variant="h6"

          sx={{

            mb:2,

            fontWeight:700,

            color:"#2563eb"

          }}

        >

          Employee Information

        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Employee Name
            </Typography>

            <Typography>
              {employee.employeeName}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Employee ID
            </Typography>

            <Typography>
              {employee.employeeCode}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Department
            </Typography>

            <Typography>
              {employee.department}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Designation
            </Typography>

            <Typography>
              {employee.designation}
            </Typography>

          </Grid>

        </Grid>

        <Divider sx={{ my:4 }} />

        {/* ===================================== */}

        <Typography

          variant="h6"

          sx={{

            mb:2,

            fontWeight:700,

            color:"#2563eb"

          }}

        >

          Shift Information

        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Shift
            </Typography>

            <Typography>
              {employee.shift}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Shift Timing
            </Typography>

            <Typography>
              {employee.shiftTime}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Check In
            </Typography>

            <Typography>
              {employee.checkIn}
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Status
            </Typography>

            <Chip

              label={employee.status}

              color={
                employee.status === "Present"
                  ? "success"
                  : employee.status === "Upcoming"
                  ? "warning"
                  : "default"
              }

            />

          </Grid>

        </Grid>

        <Divider sx={{ my:4 }} />

        {/* ===================================== */}

        <Typography

          variant="h6"

          sx={{

            mb:2,

            fontWeight:700,

            color:"#2563eb"

          }}

        >

          Additional Information

        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Weekly Off
            </Typography>

            <Typography>
              Sunday
            </Typography>

          </Grid>

          <Grid item xs={6}>

            <Typography fontWeight={600}>
              Reporting Manager
            </Typography>

            <Typography>
              Mohamed Fayaz
            </Typography>

          </Grid>

          <Grid item xs={12}>

            <Typography fontWeight={600}>
              Remarks
            </Typography>

            <Typography>

              Employee is assigned to this shift as per current workforce planning.

            </Typography>

          </Grid>

        </Grid>

      </DialogContent>

    </Dialog>

  );

}