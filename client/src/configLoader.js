let config = null;
let configPromise = null;

export async function loadConfig() {
  if (!configPromise) {
    configPromise = fetch('/config.json')
      .then(res => res.json())
      .then(data => {
        config = data;
        return config;
      });
  }
  return configPromise;
}

export function getConfig() {
  if (!config) throw new Error("Config not loaded yet!");
  return config;
}

export function isConfigLoaded() {
  return config !== null;
}