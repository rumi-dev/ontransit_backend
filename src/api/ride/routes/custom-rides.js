module.exports = {
  routes: [
    {
      method: "POST",
      path: "/rides/getUsersList",
      handler: "ride.getUsersList",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/getRideList",
      handler: "ride.getRideList",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/userRolesList",
      handler: "ride.userRolesList",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/bookingDetails",
      handler: "ride.bookingDetails",
      config: {
        auth: false,
      },
    },
  ],
};
