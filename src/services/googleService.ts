import axios from "axios";

export const getGoogleUser = async (accessToken: string) => {
  const response = await axios.get("https://www.googleapis.com/userinfo/v2/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
