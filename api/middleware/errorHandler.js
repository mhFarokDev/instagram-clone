const errorHandler = (error, req, res, next) =>{
    const errorStatus = error.status || 500;
    const errorMessage = error.message || "Unknown error.";
    const errorStack = error.stack;
     res.status(errorStatus).json({
        status : errorStatus,
        message : errorMessage,
        stack : errorStack
    })
}

export default errorHandler;