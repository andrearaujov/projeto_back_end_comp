import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. MIDDLEWARE DE AUTENTICAÇÃO
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; 
    next(); 
  } catch (error) {
    res.status(400).json({ error: 'Token inválido.' });
  }
};

// 2. MIDDLEWARE DE ADMIN
export const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
  next();
};