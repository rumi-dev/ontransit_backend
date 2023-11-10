'use strict';

/**
 * ride service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ride.ride');
