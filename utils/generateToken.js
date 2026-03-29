import jwt from 'jsonwebtoken';

export const createJWT = (payload) => {
    console.log('createJWT called with payload:', payload);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN || '7d'
    });
    
    console.log('Generated token:', token);
    console.log('Generated token length:', token?.length);
    console.log('Generated token type:', typeof token);
    
    return token;
};


export const verifyJWT = (token) => {
    console.log('verifyJWT called with token:', token?.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded payload:', decoded);
    return decoded;
}
