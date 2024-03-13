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
  async cancelBooking(ctx) {
    // @ts-ignore
    const { ride_id } = ctx.request.body;
    const entry = await strapi.entityService.update("api::ride.ride", ride_id, {
      data: {
        ride_status: "Cancelled",
      },
    });
    return "Ride has been cancelled successfully";
  },
  async commonBookings(ctx) {
    // @ts-ignore
    const { ride_status, user_id } = ctx.request.body;
    let userRides = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: { id: user_id },
        populate: ["rides"],
      });

    console.log(userRides);
    let rideDetails = userRides[0].rides.map((ride) => {
      if (ride.ride_status == ride_status) {
        return ride;
      }
    });
    rideDetails = rideDetails.filter((ride) => ride !== undefined);
    let customerRides = Promise.all(
      rideDetails.map(async (ride) => {
        let ride_details = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({
            where: { rides: ride.id },
            populate: ["role"],
          });
        let cusomterName = ride_details.filter(
          (userRide) => userRide.role.name == "ontransit_customer"
        );
        let driverName = ride_details.filter(
          (userRide) => userRide.role.name == "ontransit_driver"
        );
        let carDetails = await strapi.db
          .query("api::ride.ride")
          .findOne({ where: { id: ride.id }, populate: ["car"] });
        console.log(carDetails);
        console.log("123");
        console.log({
          rideId: ride.id,
          pickupPoint: ride.pickup_point,
          dropPoint: ride.drop_point,
          servicePerson: driverName[0].username,
          customerName: cusomterName[0].username,
          payment: ride.payment_status,
          paymentCost: ride.ride_cost,
          dateTime: ride.ride_datetime,
          carType: carDetails.car.car_type,
          vechicleNumber: carDetails.car.car_number,
          status: ride.ride_status,
          otp: ride.ride_otp,
          paymentType: ride.ride_payment_mode,
        });
        return {
          rideId: ride.id,
          pickupPoint: ride.pickup_point,
          dropPoint: ride.drop_point,
          servicePerson: driverName[0].username,
          customerName: cusomterName[0].username,
          payment: ride.payment_status,
          paymentCost: ride.ride_cost,
          dateTime: ride.ride_datetime,
          carType: carDetails.car.car_type,
          vechicleNumber: carDetails.car.car_number,
          status: ride.ride_status,
          otp: ride.ride_otp,
          paymentType: ride.ride_payment_mode,
        };
      })
    );
    return customerRides;
  },
}));
