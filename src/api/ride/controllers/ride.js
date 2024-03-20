"use strict";

/**
 * ride controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::ride.ride", ({ strapi }) => ({
  async getUsersList(ctx) {
    try {
      // @ts-ignore
      const { role, pageNo } = ctx.request.body;
      let offset = pageNo * 10 - 10;
      const data = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          limit: 10,
          offset: offset,
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
    const { ride_status, pageNo } = ctx.request.body;
    let offset = pageNo * 5 - 5;
    const rides = await strapi.db.query("api::ride.ride").findMany({
      limit: 5,
      offset: offset,
      where: { ride_status: ride_status },
      orderBy: { id: "desc" },
      populate: ["car"],
    });
    if (rides.length == 0) return [];
    const users = Promise.all(
      rides.map(async (ride) => {
        let userRides = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({ where: { rides: ride.id }, populate: ["role"] });
        let cusomterName = userRides.filter(
          (userRide) => userRide.role.name == "ontransit_customer"
        );
        let driverName = userRides.filter(
          (userRide) => userRide.role.name == "ontransit_driver"
        );
        return {
          rideId: ride.id,
          pickupPoint: ride.pickup_point,
          dropPoint: ride.drop_point,
          servicePerson: driverName.length
            ? driverName[0].username
            : "Not Availabe",
          customerName: cusomterName.length
            ? cusomterName[0].username
            : "Not Availabe",
          payment: ride.payment_status,
          paymentCost: ride.ride_cost,
          dateTime: ride.ride_datetime,
          carType: ride.car ? ride.car.car_type : "Not Available",
          vechicleNumber: ride.car ? ride.car.car_number : "Not Available",
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
    const { ride_status, user_id, pageNo } = ctx.request.body;
    let offset = pageNo * 5 - 5;
    let userRides = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        limit: 5,
        offset: offset,
        where: { id: user_id },
        populate: ["rides"],
      });
    if (userRides.length == 0) return [];
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
  async rideCreation(ctx) {
    // @ts-ignore
    const { rideData, user_id, driver_id } = ctx.request.body;
    const entry = await strapi.db.query("api::ride.ride").create({
      data: {
        ...rideData,
      },
    });

    const userData = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: user_id }, populate: ["rides"] });
    const driverData = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: driver_id }, populate: ["rides"] });
    console.log(driverData);
    const usersEntry = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id: user_id },
        data: {
          rides: [...userData.rides, entry],
        },
      });
    const driverEntry = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id: driver_id },
        data: {
          rides: [...driverData.rides, entry],
        },
      });
    console.log(driverEntry);
    return { message: "ride created", rideData: entry };
  },
}));
