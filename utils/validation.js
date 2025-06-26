export const validateId = (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error('ID inválido');
  }
  return parsedId;
};

export const validateRequiredFields = (data, fields) => {
  const errors = {};
  let hasErrors = false;

  fields.forEach(field => {
    if (!data[field]) {
      errors[field] = `El campo ${field} es requerido`;
      hasErrors = true;
    }
  });

  if (hasErrors) {
    throw {
      status: 400,
      message: 'Campos requeridos faltantes',
      errors
    };
  }
}; 