/**
 * locale
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
        //res.setLocale(req.param('lang') || sails.config.i18n.defaultLocale); 
        res.setLocale('ro'); 
        return next();
    }