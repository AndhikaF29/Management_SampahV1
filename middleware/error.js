/**
 * Error handling middleware
 */

// Handle 404 Not Found error
exports.notFound = (req, res, next) => {
    const error = new Error(`Halaman tidak ditemukan - ${req.originalUrl}`);
    console.error(`Error: Halaman tidak ditemukan - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Global error handler
exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(`Error: ${err.message}`);
    console.error(err.stack);

    res.status(statusCode);

    // Render error page if this is a webpage request
    if (req.accepts('html')) {
        return res.render('error', {
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }

    // Return JSON for API requests
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};