const browserSync = require('browser-sync').create();

browserSync.init({
  server: {
    baseDir: "./demo"
  },
  files: [
    "demo/*.html",
    "demo/assets/css/*.css",
    "demo/assets/js/*.js",
    "demo/assets/scss/**/*.scss"
  ],
  reloadOnRestart: true,
  //reloadDelay: 500,
  open: true, // Эта опция автоматически откроет браузер с правильным адресом
  port: 3001, // Укажите порт, если хотите использовать конкретный порт
  ui: {
    port: 3003 // Измените порт для пользовательского интерфейса BrowserSync
  }
});

browserSync.watch("demo/assets/scss/**/*.scss").on("change", browserSync.reload);
