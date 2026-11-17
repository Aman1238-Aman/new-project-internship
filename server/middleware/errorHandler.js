export function notFound(req, res) { res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500, message = err.message || 'Internal server error', code = err.code || 'ERROR';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); code = 'VALIDATION_ERROR'; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid identifier or value'; code = 'BAD_REQUEST'; }
  if (err.code === 11000) { status = 409; const key = Object.keys(err.keyPattern || {})[0]; message = `${key === 'email' ? 'Email' : key === 'employeeId' ? 'Employee ID' : 'Value'} already exists`; code = 'DUPLICATE'; }
  if (err.name === 'MongoServerError' && err.code === 112) { status = 409; message = 'A concurrent update conflicted. Please retry.'; code = 'WRITE_CONFLICT'; }
  if (process.env.NODE_ENV !== 'production' && status >= 500) console.error(err);
  res.status(status).json({ success: false, message, code });
}
