 
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
 
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
 
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
 
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else {
    sendProdError(err, req, res);
  }
};
 
const sendDevError = (err, req, res) => { 
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
 
const sendProdError = (err, req, res) => { 
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }  
  else { 
    console.error('ERROR 💥', err);
     
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

module.exports = {
  AppError,
  catchAsync,
  globalErrorHandler
};
