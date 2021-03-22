const getCookie = (cname: string): string => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  for (let cookie of decodedCookie.split(";")) {
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
};

export default getCookie;
