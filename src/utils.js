module.exports = {
    removeCmd: function( ctx ) {
	    return ctx.message.text.split(' ').slice( 1 ).join(' ')
    },

}