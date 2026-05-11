// module.exports = {

//   apps: [

//     {

//       name: "hostel-backend",

//       script: "./src/index.js",

//       instances: 3,

//       exec_mode: "cluster",

//       watch: false,

//       env: {

//         NODE_ENV: "development",

//         PORT: 8000
//       },

//       node_args:
//         "--experimental-modules"
//     }
//   ]
// };

module.exports = {

  apps: [

    {

      name: "hostel-backend",

      script: "./src/index.js",

      instances: 3,

      exec_mode: "cluster",

      watch: false,

      env: {

        PORT: 8000,

        NODE_ENV: "production"
      }
    }
  ]
};