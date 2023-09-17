const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    experimentalOriginDependencies: true
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
});
