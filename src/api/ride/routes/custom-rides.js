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
    {
      method: "POST",
      path: "/cancelBooking",
      handler: "ride.cancelBooking",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/commonBookings",
      handler: "ride.commonBookings",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/rideCreation",
      handler: "ride.rideCreation",
      config: {
        auth: false,
      },
    },
  ],
};
