localStorage.getItem("user-color-scheme") &&
  document.documentElement.setAttribute(
    "data-user-color-scheme",
    localStorage.getItem("user-color-scheme")
  );