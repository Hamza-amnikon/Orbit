import {
    Backdrop,
    CircularProgress,
    Typography,
    Box
} from "@mui/material";

function LoginLoader({ open }) {

    return (

        <Backdrop
            open={open}
            sx={{
                zIndex:9999,
                backdropFilter:"blur(6px)",
                background:"rgba(15,23,42,.45)"
            }}
        >

            <Box
                sx={{
                    background:"#fff",
                    width:340,
                    borderRadius:5,
                    p:5,
                    textAlign:"center",
                    boxShadow:"0 25px 60px rgba(0,0,0,.18)"
                }}
            >

                <CircularProgress
                    size={60}
                />

                <Typography
                    variant="h5"
                    mt={4}
                    fontWeight={700}
                >

                    Signing You In

                </Typography>

                <Typography
                    color="text.secondary"
                    mt={1}
                >

                    Please wait while we verify your credentials.

                </Typography>

            </Box>

        </Backdrop>

    );

}

export default LoginLoader;