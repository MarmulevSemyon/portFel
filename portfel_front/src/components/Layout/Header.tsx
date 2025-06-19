import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    useTheme,
    Box,
    Divider,
    styled
} from '@mui/material';
import {
    AccountCircle,
    MenuBook,
    Wallet,
    Brightness4,
    Brightness7
} from '@mui/icons-material';
import { useState } from 'react';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
}));

const Header = () => {
    const theme = useTheme();
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMobileMenuAnchor(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        handleMenuClose();
    };

    return (
        <StyledAppBar position="static">
            <Toolbar>
                {/* Логотип */}
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontFamily: 'Monospace',
                        fontWeight: 'bold',
                        letterSpacing: '.3rem'
                    }}
                >
                    <Wallet sx={{ mr: 1, verticalAlign: 'middle' }} />
                    PORTFOLIO MANAGER
                </Typography>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/"
                                startIcon={<MenuBook />}
                                sx={{ mx: 1 }}
                            >
                                Portfolios
                            </Button>

                            <IconButton
                                size="large"
                                edge="end"
                                onClick={handleMenuOpen}
                                color="inherit"
                                sx={{ ml: 2 }}
                            >
                                <AccountCircle fontSize="large" />
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem disabled>
                                    <Avatar sx={{ mr: 2 }}>{user.username[0].toUpperCase()}</Avatar>
                                    {user.username}
                                </MenuItem>
                                <Divider />
                                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                                sx={{ mx: 1 }}
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/register"
                                variant="outlined"
                                sx={{ mx: 1 }}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>

                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={handleMobileMenuOpen}
                    >
                        <AccountCircle />
                    </IconButton>

                    <Menu
                        anchorEl={mobileMenuAnchor}
                        open={Boolean(mobileMenuAnchor)}
                        onClose={handleMenuClose}
                    >
                        {user ? (
                            [
                                <MenuItem key="profile" component={Link} to="/profile">
                                    Profile
                                </MenuItem>,
                                <MenuItem key="portfolios" component={Link} to="/portfolios">
                                    Portfolios
                                </MenuItem>,
                                <MenuItem key="logout" onClick={handleLogout}>
                                    Logout
                                </MenuItem>
                            ]
                        ) : (
                            [
                                <MenuItem key="login" component={Link} to="/login">
                                    Login
                                </MenuItem>,
                                <MenuItem key="register" component={Link} to="/register">
                                    Register
                                </MenuItem>
                            ]
                        )}
                    </Menu>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;