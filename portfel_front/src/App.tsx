import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Provider} from 'react-redux';
import {ThemeProvider} from '@mui/material/styles';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import {store} from "./store/store";
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AuthPage from './pages/Auth';
import PortfolioDetail from './pages/PortfolioPage'
import AssetDetailPage from './pages/AssetDetailPage';
import UserProfile from './pages/UserProfile';

function App() {
    return (
        <Provider store={store}>
            {/*<ThemeProvider theme={theme}>*/}
            <CssBaseline/>
            <Router>
                <Header/>
                <Routes>
                    <Route index element={<Dashboard/>}/>
                    <Route path="portfolio/:id" element={<PortfolioDetail />} />
                    <Route path="/login" element={<AuthPage type="login"/>}/>
                    <Route path="/register" element={<AuthPage type="register"/>}/>
                    <Route path="/assets/:assetId" element={<AssetDetailPage />} />
                    <Route path="/profile" element={<UserProfile />} />
                </Routes>
            </Router>
            {/*</ThemeProvider>*/}
        </Provider>
    );
}

export default App;