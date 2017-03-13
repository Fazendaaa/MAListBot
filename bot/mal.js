require( 'dotenv' ).config( { path: '../.env' } )

const Telegraf = require( 'telegraf' )
const mal = require( 'maljs' )
const bot = new Telegraf( process.env.BOT_TOKEN )

const welcome = "Welcome to MAL bot.\n\nType:\n/help"
const help = "Usage:\n\n\
@MAListbot 'anime/manga/character name'\n\
/anime \'anime name\'\n\
/manga \'manga name\'\n\
/character \'character name\'\n\
/source -- see the code behind MAListbot\n\n\
Any bugs or suggestions, talk to: @farm_kun"

bot.command( 'start', ctx => {
	ctx.reply( welcome )
})

bot.command( 'help', ctx => {
	ctx.reply( help )
})

function removeCmd( ctx ) {
	return ctx.message.text.split(' ').slice( 1 ).join(' ')
}

/*	As  Telegraf  recives  all sent messages in unicode, some pieces of text may
	become  emoji. This function intent to replace this unicode emojis for their
	equivalent in ASCII.
*/
function messageToString( message ) {
	return Buffer
		  .from( message, 'ascii' )
		  .toString( 'ascii' )
		  .replace( /(?:=\(|:0|:o|: o|: 0)/, ': o' )
}

bot.command( 'anime', ctx => {
	const anime = messageToString( removeCmd( ctx ) )

	mal.quickSearch( anime, 'anime' )
	.then( data => ctx.reply( data.anime[ 0 ].mal.url+data.anime[ 0 ].path ) )
    .catch( issue => console.log( '/anime quickSearch: ', issue ) )
} )

bot.command( 'manga', ctx => {
	const manga = messageToString( removeCmd( ctx ) )

	mal.quickSearch( manga, 'manga' )
	.then( data => ctx.reply( data.manga[ 0 ].mal.url+data.manga[ 0 ].path ) )
    .catch( issue => console.log( '/manga quickSearch: ', issue ) )
} )

bot.command( 'character', ctx => {
	const character = messageToString( removeCmd( ctx ) )

	mal.quickSearch( character, 'character' )
	.then( data => 
		ctx.reply( data.character[ 0 ].mal.url+data.character[ 0 ].path ) )
    .catch( issue => console.log( '/character quickSearch: ', issue ) )
} )

bot.command( 'source', ctx => {
	ctx.reply( 'https://github.com/Fazendaaa/My_anime_list_telegram_bot' )
})

function verifyData( data ) {
	return ( null != data && undefined != data && !isNaN( data ) ) ? data : 'Not avaliable'
}

function replyMarkdown( data ) {
	const score = verifyData( data.score )
	const ranked = verifyData( data.ranked )
	const popularity = verifyData( data.popularity )

	return `[${data.title}](${data.mal.url + data.path})
- _Ranked_: *#${ranked}*
- _Popularity_: *#${popularity}*
- _Score_: *${score}*`
}

/*	Telegram  return  all  data  for  inline request as a JSON, replyInline only
	takes  all  info  recieved  through quickSearch and 'cleans it' to put it in
	Telegram standars
*/
function replyInline( data ) {
	return {
		id: data.id,
		title: '[' + data.type.toUpperCase() + '] ' + data.title,
		type: 'article',
		input_message_content: {
			message_text: replyMarkdown( data ),
			parse_mode: 'Markdown'
		},
		description: data.description,
		thumb_url: data.cover
	}
}

function __inlineSearch( array ) {
	/*	All  info  about  the  searched value as anime, characters or even manga
		need  time  to  be  processed  a  new Promise must be made, to wait this
		values to be returned, otherwise the user will recive nothing
	*/
	return Promise
	.all( array.map( data => 
		data.fetch( )
		.then( json => replyInline( json ) )
		.catch( issue => console.log( '__inlineSearch fetch: ', issue ) )
	) )
	.catch( issue => console.log( '__inlineSearch Promise: ', issue ) )
}

function inlineSearch( search ) {
	return mal.quickSearch( search )
	.then( array =>	__inlineSearch(	array.character.concat(
									array.anime.concat( array.manga ) ) ) )
	.catch( issue => console.log( 'inlineSearch quickSearch: ', issue ) )
}

bot.on( 'inline_query', ctx => {
	const search = messageToString( ctx.inlineQuery.query ) || ''

	inlineSearch( search )
	.then( results => ctx.answerInlineQuery( results ) )
	.catch( issue => console.log( 'inlineSearch: ', issue ) )
} )

bot.startPolling( )
