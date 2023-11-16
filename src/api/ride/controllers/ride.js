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
      console.log(role);
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
        };
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  },
}));
