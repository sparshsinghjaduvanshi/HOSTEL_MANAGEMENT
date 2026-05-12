module.exports = {
  apps: [
    {
      name: "hostel-backend",

      script: "./src/index.js",

      instances: 1,

      exec_mode: "fork",

      watch: false,

      env: {
        PORT: 8000,
        NODE_ENV: "production",

        CLOUDINARY_CLOUD_NAME:
          process.env.CLOUDINARY_CLOUD_NAME,

        CLOUDINARY_API_KEY:
          process.env.CLOUDINARY_API_KEY,

        CLOUDINARY_API_SECRET:
          process.env.CLOUDINARY_API_SECRET
      }
    }
  ]
};