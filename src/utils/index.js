export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseJwt(token) {
  if (token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}

export const getAuthToken = () => {
  const userTokenData = localStorage.getItem("jwt");
  return JSON.parse(userTokenData);
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumberForDisplay(num) {
  if (num < 1000) {
    return `${num}`;
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else {
    return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  }
}
