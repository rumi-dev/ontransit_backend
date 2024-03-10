"use strict";

/**
 * ride controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::ride.ride", ({ strapi }) => ({
  async getUsersList(ctx) {
    try {
      // @ts-ignore
      const { role } = ctx.request.body;
      const data = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          orderBy: { id: "desc" },
          populate: ["role", "rides"],
        });
      const returnData = data.filter((d) => d?.role?.name == role);
      const response = returnData.map((d) => {
        return {
          name: d.username,
          rides: d.rides.length,
          id: d.id,
        };
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  },
  async getRideList(ctx) {
    // @ts-ignore
    const { ride_status } = ctx.request.body;
    const rideData = await strapi.db.query("api::ride.ride").findMany({
      where: { ride_status: ride_status },
      orderBy: { id: "desc" },
      populate: ["car"],
    });
    const userData = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        orderBy: { id: "desc" },
        populate: ["role", "rides"],
      });

    return { rides: rideData, user: userData };
  },
  async userRolesList(ctx) {
    // @ts-ignore
    const { role } = ctx.request.body;
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({ populate: ["role"] });
    const filteredRole = users.filter((u) => u.role.name == role);
    return { count: filteredRole.length };
  },
  async bookingDetails(ctx) {
    // @ts-ignore
    const { ride_status } = ctx.request.body;
    const rides = await strapi.db.query("api::ride.ride").findMany({
      where: { ride_status: ride_status },
      orderBy: { id: "desc" },
      populate: ["car"],
    });
    const users = Promise.all(
      rides.map(async (ride) => {
        console.log(ride);
        let userRides = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({ where: { rides: ride.id }, populate: ["role"] });
        let cusomterName = userRides.filter(
          (userRide) => userRide.role.name == "ontransit_customer"
        );
        console.log(userRides);
        let driverName = userRides.filter(
          (userRide) => userRide.role.name == "ontransit_driver"
        );
        return {
          rideId: ride.id,
          pickupPoint: ride.pickup_point,
          dropPoint: ride.drop_point,
          servicePerson: driverName[0].username,
          customerName: cusomterName[0].username,
          payment: ride.payment_status,
          paymentCost: ride.ride_cost,
          dateTime: ride.ride_datetime,
          carType: ride.car.car_type,
          vechicleNumber: ride.car.car_number,
          status: ride.ride_status,
          otp: ride.ride_otp,
          paymentType: ride.ride_payment_mode,
        };
      })
    );
    return users;
  },
}));
