/**
 * activity-log controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::activity-log.activity-log', () => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) return ctx.unauthorized('Login required');

    const body = ctx.request.body.data;
    body.users_permissions_user = user.id;

    const entry = await strapi.entityService.create(
      'api::activity-log.activity-log',
      {
        data: body,
        populate: ['users_permissions_users'],
      }
    );

    return entry;
  },

  async find(ctx) {
    const user = ctx.state.user;

    const result = await strapi.entityService.findMany(
      'api::activity-log.activity-log',
      {
        filters: { users_permissions_users: user.id },
        populate: ['users_permissions_users'],
      }
    );

    return result;
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const result = await strapi.entityService.findOne(
      'api::activity-log.activity-log',
      id,
      {
        populate: ['users_permissions_users'],
      }
    )
    if(!result) return ctx.notFound("Not found or not yours")
        return result;
  },
}));