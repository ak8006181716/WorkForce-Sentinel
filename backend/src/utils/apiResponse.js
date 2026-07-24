const success = (res, data = null, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data = null, message = 'Created') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

export default { success, created };
