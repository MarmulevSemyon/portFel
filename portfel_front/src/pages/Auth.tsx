import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {loginUser, registerUser} from '../store/slices/authSlice';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    CircularProgress,
    Paper,
    useTheme
} from '@mui/material';
import {LockOpen, PersonAdd} from '@mui/icons-material';

interface AuthPageProps {
    type: 'login' | 'register';
}

const AuthPage = ({type}: AuthPageProps) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {user, status, error} = useAppSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (type === 'login') {
            await dispatch(loginUser({
                username: formData.username,
                password: formData.password
            }));
        } else {
            if (formData.password !== formData.confirmPassword) {
                return;
            }
            await dispatch(registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            })).then(() => navigate('/'));
        }
    };

    const isLogin = type === 'login';
    const isLoading = status === 'loading';

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{
                p: 4,
                mt: 8,
                borderRadius: 4,
                background: theme.palette.background.paper
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4
                }}>
                    {isLogin ? (
                        <LockOpen sx={{fontSize: 40, color: theme.palette.primary.main, mb: 2}}/>
                    ) : (
                        <PersonAdd sx={{fontSize: 40, color: theme.palette.primary.main, mb: 2}}/>
                    )}
                    <Typography variant="h4" component="h1">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 3}}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        variant="outlined"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                        disabled={isLoading}
                    />

                    {!isLogin && (
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            variant="outlined"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            disabled={isLoading}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        variant="outlined"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        disabled={isLoading}
                    />

                    {!isLogin && (
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            margin="normal"
                            variant="outlined"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                            disabled={isLoading}
                            error={formData.password !== formData.confirmPassword}
                            helperText={
                                formData.password !== formData.confirmPassword
                                    ? "Passwords don't match"
                                    : ""
                            }
                        />
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.5,
                            borderRadius: 2
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit"/>
                        ) : isLogin ? (
                            'Sign In'
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Typography variant="body2">
                                {isLogin ? (
                                    <>Don't have an account?{' '}
                                        <Link to="/register" style={{
                                            color: theme.palette.primary.main,
                                            textDecoration: 'none',
                                            fontWeight: 500
                                        }}>
                                            Sign Up
                                        </Link>
                                    </>
                                ) : (
                                    <>Already have an account?{' '}
                                        <Link to="/login" style={{
                                            color: theme.palette.primary.main,
                                            textDecoration: 'none',
                                            fontWeight: 500
                                        }}>
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AuthPage;