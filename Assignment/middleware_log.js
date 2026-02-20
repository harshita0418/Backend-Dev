// Exercise 2: Logs response time for every request

function responseTimeLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = (Number(end - start) / 1_000_000).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${durationMs} ms`);
  });

  next();
}

module.exports = responseTimeLogger;
