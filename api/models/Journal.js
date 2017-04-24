/**
 * Journal
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  adapter: 'brm',
  settings: {
	service:'/BRMRead.svc',
	resource:'Events',
	useResource:true
  },
  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
  }

};
