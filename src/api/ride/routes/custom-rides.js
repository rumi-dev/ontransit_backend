module.exports = {
  routes: [
    {
      method: "POST",
      path: "/getUsersList",
      handler: "ride.getUsersList",
      config: {
        auth: false,
      },
    },
  ],
};
