require( 'dotenv' ).config( { path: '../.env' } )

const Telegraf = require( 'telegraf' )
const mal = require( 'maljs' )
const bot = new Telegraf( process.env.BOT_TOKEN )

const welcome = "Welcome to MAL bot.\n\nType:\n/help"
const help = "Usage:\n\n\
@MAListbot 'anime name'\n\
/anime \'anime name\'\n\
/source -- see the code behind MAListbot\n\n\
Any bugs or suggestions, talk to: @farm_kun"

bot.command( 'start', ctx => {
	console.log( 'start', ctx.from )
	ctx.reply( welcome )
})

bot.command( 'help', ctx => {
	console.log( 'help', ctx.from )
	ctx.reply( help )
})

function messageToString( message ) {
	return Buffer
		  .from( message, 'ascii' )
		  .toString( 'ascii' )
		  .replace( /(?:=\(|:0|:o|: o|: 0)/, ': o' )
}

bot.command( 'anime', ctx => {
	const anime = messageToString( ctx.message.text.
								   split(' ').slice( 1 ).join(' ') )

	mal.quickSearch( anime ).then( response => {
	    response.anime[ 0 ].fetch( ).then( data => {
            ctx.reply( data.mal.url+data.path )
	    } )
    } )
} )

bot.command( 'source', ctx => {
	ctx.reply( 'https://github.com/Fazendaaa/My_anime_list_telegram_bot' )
})

function replyInline( data ) {
	return {
		id: data.id,
		title: data.title,
		type: 'article',
		input_message_content: {
			message_text: data.mal.url+data.path,
			parse_mode: 'HTML'
		},
		description: data.description,
		thumb_url: data.cover
	}
}

function inlineSearch( search, callback ) {
	const inline = [ ]

	mal.quickSearch( search ).then( response => {
	    response.anime[ 0 ].fetch( ).then( anime => {
	    	inline.push( replyInline( anime ) )
	    	callback( inline )
	    } )
    } )
}

bot.on( 'inline_query', ctx => {
	const search = messageToString( ctx.inlineQuery.query ) || ''

	inlineSearch( search, response => {
		ctx.answerInlineQuery( response )
	} )
} )

bot.startPolling( )