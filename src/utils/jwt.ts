export const generateJWT = (email: string) => {
  const token = {
    email,
    exp: Date.now() + 60 * 60 * 1000, // 1 hour
  };

  return JSON.stringify(token);
};

export const isTokenExpired = (tokenString: string) => {
  try {
    const token = JSON.parse(tokenString);
    const currentTime = Date.now();

    return currentTime > token.exp;
  } catch (e) {
    return true;
  }
};
