require( 'dotenv' ).config( { path: '../.env' } )

const Telegraf = require( 'telegraf' )
const mal = require( 'maljs' )
const bot = new Telegraf( process.env.BOT_TOKEN )

const welcome = "Welcome to MAL bot.\n\nType:\n/help"
const help = "Usage:\n\n\
@MAListbot 'anime name'\n\
/anime \'anime name\'\n\
/manga \'manga name\'\n\
/source -- see the code behind MAListbot\n\n\
Any bugs or suggestions, talk to: @farm_kun"

bot.command( 'start', ctx => {
	ctx.reply( welcome )
})

bot.command( 'help', ctx => {
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

	mal.quickSearch( anime, 'anime' )
	.then( response => {
		const data = response.anime[ 0 ]
		ctx.reply( data.mal.url+data.path )
    } )
    .catch( issue => console.log( '/anime quickSearch: ', issue ) )
} )

bot.command( 'manga', ctx => {
	const manga = messageToString( ctx.message.text.
								   split(' ').slice( 1 ).join(' ') )

	mal.quickSearch( manga, 'manga' )
	.then( response => {
		const data = response.manga[ 0 ]
		ctx.reply( data.mal.url+data.path )
    } )
    .catch( issue => console.log( '/manga quickSearch: ', issue ) )
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

function inlineSearch( search ) {
	return mal.quickSearch( search )
	.then( response => 
		Promise.all( response.anime.map( anime => 
			anime.fetch()
			.then( json => replyInline( json ) )
			.catch( issue => console.log( 'inlineSearch fetch: ', issue ) )
		) )
		.catch( issue => console.log( 'inlineSearch Promise: ', issue ) )
	)
	.catch( issue => console.log( 'inlineSearch quickSearch: ', issue ) )
}

bot.on( 'inline_query', ctx => {
	const search = messageToString( ctx.inlineQuery.query ) || ''

	inlineSearch( search )
	.then( results => ctx.answerInlineQuery( results ) )
	.catch( issue => console.log( 'inlineSearch: ', issue ) )
} )

bot.startPolling( )