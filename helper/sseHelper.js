function safeWrite(res, payload) {
  try {
    if (res.writableEnded) return false;
    res.write(payload);
    if (typeof res.flush === 'function') res.flush();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { safeWrite };