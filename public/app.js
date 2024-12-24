document.getElementById("onButton").addEventListener("click", () => {
  controlDevice("on");
});

document.getElementById("offButton").addEventListener("click", () => {
  controlDevice("off");
});
window.addEventListener("load", () => {
  controlDevice("status"); 
})
function controlDevice(state) {
  fetch(`/api/control?state=${state}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("status").textContent = `Status: ${data.message}`;
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("status").textContent = "Status: Error";
    });
}
