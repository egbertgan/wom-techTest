export const generateJWT = (email: string) => {
  const token = {
    email,
    exp: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  return JSON.stringify(token);
};
