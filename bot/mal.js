require( 'dotenv' ).config( { path: '../.env' } )

const Telegraf = require( 'telegraf' )
const mal = require( 'maljs' )
const bot = new Telegraf( process.env.BOT_TOKEN )

bot.use( Telegraf.log() )

const welcome = "Welcome to MAL bot.\n\nType:\n/help"
const help = "Usage:\n\n\
@MAListbot 'anime/manga/character name'\n\
/anime \'anime name\'\n\
/manga \'manga name\'\n\
/character \'character name\'\n\
/source -- see the code behind MAListbot\n\n\
Any bugs or suggestions, talk to: @farmy"
const defaultResponse = 'Please, feel free to search MAL.'

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
		  .replace( '-', ' ' )
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

function verifyData( data, unit ) {
	return ( null != data && undefined != data && isNaN( data ) ) ?
		   `${unit}${data}` : 'Not avaliable'
}

function verifyDataMd( pre, data, unit ) {
	return ( null != data && undefined != data ) ?
		   `- _${pre}_: *${unit}${data}*\n` : ''
}

function replyMarkdown( data ) {
	const score = verifyDataMd( 'Score', data.score, '' )
	const ranked = verifyDataMd( 'Ranked', data.ranked, '#' )
	const popularity = verifyDataMd( 'Popularity	', data.popularity, '#' )

	return `[\u200B](${data.cover})[${data.title}](${data.mal.url + data.path})
${ranked}${popularity}${score}`
}

bot.action( /.+/, ( ctx ) => {
	return ctx.answerCallbackQuery( ctx.match[ 0 ], undefined, true )  
})

function replyButton( description ) {
	return Telegraf.Extra
				   .markdown( )
				   .markup( ( m ) =>
				      m.inlineKeyboard( [
					      m.callbackButton( 'Description',
						  description.substring( 0, 40 ) )
				   ] )
	).reply_markup
}

/*	Telegram  return  all  data  for  inline request as a JSON, replyInline only
	takes  all  info  recieved  through quickSearch and 'cleans it' to put it in
	Telegram standars
*/
function replyInline( data ) {
	const description = verifyData( data.description, '' )

	return {
		id: data.id,
		title: '[' + data.type.toUpperCase() + '] ' + data.title,
		type: 'article',
		input_message_content: {
			message_text: replyMarkdown( data ),
			parse_mode: 'Markdown',
			disable_web_page_preview: false
		},
		reply_markup: replyButton( data.description ),
		description: description,
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
	if( '' == search )
		return Promise.all( [ {
									id: '0',
									title: 'Search anything, Onii-chan',
									type: 'article',
									input_message_content: {
										message_text: defaultResponse,
										parse_mode: 'Markdown'
									},
									description: defaultResponse,
									thumb_url: 'http://bit.ly/2nNA6D3',
							  } ] )

	else
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
