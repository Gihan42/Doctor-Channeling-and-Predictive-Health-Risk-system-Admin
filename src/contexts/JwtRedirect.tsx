// JwtRedirect.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

const isJwtValid = (): boolean => {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        return decoded.exp > now;
    } catch {
        return false;
    }
};

const JwtRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isJwtValid()) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return null;
};

export default JwtRedirect;
