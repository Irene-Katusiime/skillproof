// Request Logger Middleware
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  console.log(`➡️  ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '✅';
    
    console.log(
      `${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

// Sanitize sensitive data from logs
function sanitizeBody(body: any): any {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}
