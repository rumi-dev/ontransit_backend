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
}));
