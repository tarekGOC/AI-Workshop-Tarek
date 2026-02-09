const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');

const keycloakInternalUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const keycloakPublicUrl = process.env.KEYCLOAK_PUBLIC_URL || keycloakInternalUrl;
const realm = process.env.KEYCLOAK_REALM || 'appointment-booking';

// Use the internal Docker URL for fetching JWKS keys
const jwksClient = jwksRsa({
  jwksUri: `${keycloakInternalUrl}/realms/${realm}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err.message);
      callback(err, null);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Accept tokens issued by either the public or internal Keycloak URL
  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: [`${keycloakPublicUrl}/realms/${realm}`, `${keycloakInternalUrl}/realms/${realm}`],
  }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    req.user.roles = decoded.realm_access?.roles || decoded.realm_roles || [];
    req.user.username = decoded.preferred_username;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const roles = req.user.roles || [];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// optional auth - don't fail if no token, just set req.user if present
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `${keycloakUrl}/realms/${realm}`,
  }, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
      req.user.roles = decoded.realm_access?.roles || decoded.realm_roles || [];
      req.user.username = decoded.preferred_username;
    }
    next();
  });
}

module.exports = { requireAuth, requireRole, optionalAuth };
