function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  while (!Spicetify?.showNotification) {
    await sleep(100)
  }

  // Show message on start.
  Spicetify.showNotification("Welcome!");
})()