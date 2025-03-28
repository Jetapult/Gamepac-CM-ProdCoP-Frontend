
export const getUserFromSession = (session) => {
  return {
    id: session.user.id,
    email: session.user.email,
    avatar: session.user.user_metadata.avatar_url,
    username: session.user.user_metadata.user_name,
    provider: "github"
  };
};
