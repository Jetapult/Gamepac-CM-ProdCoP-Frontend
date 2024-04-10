export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("jwt", JSON.stringify(data));
    localStorage.setItem("loginTime", Date.now());
    next();
  }
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") {
    return false;
  }

  if (localStorage.getItem("jwt")) {
    if (
      Number(localStorage.getItem("loginTime")) <
      Date.now() - 1000 * 86400 * 7
    ) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("lastUpdateProfilePopupTime");
      window.location.replace("/feed");
    }
    return JSON.parse(localStorage.getItem("jwt"));
  } else {
    return false;
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
    localStorage.removeItem("loginTime");
  }
};
