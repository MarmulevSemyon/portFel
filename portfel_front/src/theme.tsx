import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#ffeb3b',
        },
        secondary: {
            main: '#000000',
        },
        background: {
            default: '#4d4d2a',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#ffeb3b',
        },
    },
});

export default theme;