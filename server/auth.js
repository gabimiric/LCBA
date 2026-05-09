import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lab7-demo-secret';
const TOKEN_TTL_SECONDS = 60;

export const ROLE_PERMISSIONS = {
  ADMIN: ['READ', 'WRITE', 'DELETE'],
  WRITER: ['READ', 'WRITE'],
  VISITOR: ['READ'],
};

function normalizePermissions(permissions) {
  return [...new Set((permissions || []).map((permission) => String(permission).toUpperCase()))];
}

export function buildAuthContext({ role, permissions }) {
  const normalizedRole = role ? String(role).toUpperCase() : undefined;
  const rolePermissions = normalizedRole && ROLE_PERMISSIONS[normalizedRole] ? ROLE_PERMISSIONS[normalizedRole] : [];
  const explicitPermissions = Array.isArray(permissions) ? permissions : [];
  const normalizedPermissions = normalizePermissions([...rolePermissions, ...explicitPermissions]);

  if (normalizedPermissions.length === 0) {
    throw new Error('No valid permissions were provided.');
  }

  return {
    role: normalizedRole,
    permissions: normalizedPermissions,
  };
}

export function issueToken(authContext) {
  const token = jwt.sign(authContext, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();

  return {
    token,
    expiresInSeconds: TOKEN_TTL_SECONDS,
    expiresAt,
    role: authContext.role,
    permissions: authContext.permissions,
  };
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requirePermission(requiredPermission) {
  const normalized = String(requiredPermission).toUpperCase();

  return (req, res, next) => {
    const tokenPermissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    if (!tokenPermissions.includes(normalized)) {
      return res.status(403).json({ message: `Missing required permission: ${normalized}` });
    }

    return next();
  };
}
