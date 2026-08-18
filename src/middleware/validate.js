export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!parsed.success) {
      const err = new Error(parsed.error.issues[0]?.message || 'Validation failed');
      err.statusCode = 400;
      err.expose = true;
      return next(err);
    }

    req.validated = parsed.data;
    return next();
  };
}
