import 'expo-router/entry';
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/uk-pool-tracker-roikic/sw.js");
  });
}
