// TODO: is there a better way to do this?

const details = document.querySelector("details#acting");

if (details) {
let detailsState = sessionStorage.getItem("acting-details-state");

if (detailsState) {
  // local/session storage only works with strings, so we need to convert it to a boolean
  let state = JSON.parse(detailsState);
  details.open = state;
}

details.addEventListener("toggle", (event) => {
  sessionStorage.setItem("acting-details-state", details.open);
});  
}
