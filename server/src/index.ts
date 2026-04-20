// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      // Find the authenticated role
      const authenticatedRole = await strapi
        .db.query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (authenticatedRole) {
        const permissions = [
          'api::food-log.food-log.create',
          'api::food-log.food-log.find',
          'api::food-log.food-log.findOne',
          'api::food-log.food-log.update',
          'api::food-log.food-log.delete',
          'api::activity-log.activity-log.create',
          'api::activity-log.activity-log.find',
          'api::activity-log.activity-log.findOne',
          'api::activity-log.activity-log.update',
          'api::activity-log.activity-log.delete',
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.update'
        ];

        for (const action of permissions) {
          const existingPermission = await strapi
            .db.query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: authenticatedRole.id,
              },
            });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: authenticatedRole.id,
              },
            });
          }
        }
        console.log('Successfully bootstrapped permissions for Authenticated role.');
      }
    } catch (error) {
      console.error('Error bootstrapping permissions:', error);
    }
  },
};
