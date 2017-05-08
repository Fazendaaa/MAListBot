require( 'dotenv' ).config( { path: '../.env' } )

const utils = require( './utils' )
const mal = require( 'maljs' )
const moment = require( 'moment' )
const popura = require( 'popura' )( process.env.MAL_USERNAME, process.env.MAL_PASSWORD )
const Telegraf = require( 'telegraf' )
const bot = new Telegraf( process.env.BOT_TOKEN )
const HorribleSubsAPI = require('horriblesubs-api');
const HS = new HorribleSubsAPI();

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

function removeCmd( ctx ) {
	return ctx.message.text.split(' ').slice( 1 ).join(' ')
}

function messageToString( message ) {
    return Buffer
            .from( message, 'ascii' )
            .toString( 'ascii' )
            .replace( /(?:=\(|:0|:o|: o|: 0)/, ': o' )
}

bot.command( 'start', ctx => {
	ctx.reply( welcome )
})

bot.command( 'help', ctx => {
	ctx.reply( help )
})

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
	return ( null != data && undefined != data ) ? `${data}` : 'Not avaliable'
}

function verifyDataMd( pre, data, unit ) {
	return ( null != data && undefined != data && !isNaN( data ) ) ?
		   `- _${pre}_: *${unit}${data}*\n` : ''
}

function replyMarkdown( data ) {
	const score = verifyDataMd( 'Score', data.score, '' )
	const ranked = verifyDataMd( 'Ranked', data.ranked, '#' )
	const popularity = verifyDataMd( 'Popularity', data.popularity, '#' )

	return `[\u200B](${data.cover})[${data.title}](${data.mal.url + data.path})
${ranked}${popularity}${score}`
}

function replyCallback( string ) {
	const lastIndex = string.lastIndexOf(" ")
	const newString = string.substring( 0, lastIndex )
	
	return `${newString}...`
}

function verifyObject( obj ) {
	return ( null != obj && undefined != obj && isNaN( obj ) ) ?
			 obj.join("\n") : 'Not Available'
}


/*
{ '1': 
      { '1': 
         { '480p': 
            { url: 'magnet:?xt=urn:btih:XKA3DE3SUUZU346QXC6VRX5G7WB6EXY2&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=http://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=http://tracker.opentrackr.org:1337/announce&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=http://explodie.org:6969/announce&tr=http://p4p.arenabg.com:1337/announce&tr=http://mgtracker.org:6969/announce',
              seeds: 0,
              peers: 0,
              provider: 'HorribleSubs' },
           '720p': 
            { url: 'magnet:?xt=urn:btih:T7B35NITUXKVCBU72SU6AC2HFAJWID6S&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=http://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=http://tracker.opentrackr.org:1337/announce&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=http://explodie.org:6969/announce&tr=http://p4p.arenabg.com:1337/announce&tr=http://mgtracker.org:6969/announce',
              seeds: 0,
              peers: 0,
              provider: 'HorribleSubs' },
           '1080p': 
            { url: 'magnet:?xt=urn:btih:QD4NWYKB2NOS4JIINVALZIY3OAC6A6W7&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=http://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=http://tracker.opentrackr.org:1337/announce&tr=udp://tracker.zer0day.to:1337/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=http://explodie.org:6969/announce&tr=http://p4p.arenabg.com:1337/announce&tr=http://mgtracker.org:6969/announce',
              seeds: 0,
              peers: 0,
              provider: 'HorribleSubs' } },

*/

function replyEpi(epi) {
	console.log(epi, '\n\n\n')
	//return epi.map(e => `Episode ${e}:\n${e.map()}`)
}

function replySeason(anime) {
	console.log(anime)
	//console.log(anime.episodes.map(e => e[0]))
	//return anime.episodes.map(season => `Season ${season}:\n${season.map(e => replyEpi(e))}`)
}

function torrent(string) {
	return HS.getAllAnime()
			 .then(res => {
				 for(i in res) {
				 	if(res[i].title.toLowerCase() == string.toLowerCase()) {
						return HS.getAnimeData(res[i])
								 .then(res => Promise.resolve(require('util').inspect(res, { depth: null }))
								 					 .then(data => replySeason(data)))
								 .catch(err => console.log( '[ERROR] torrent - for: ',err))
					 	 break
				  	 }
				 }

				return 'Not Availiable in Horrible Sub'
			})
			.catch(err => console.log( '[ERROR] torrent: ',err))
}

function answerCallbackAnime( button, title ) {
	return popura.searchAnimes( title )
				 .then( anime => {
					 switch( button ) {
						 /*	d == DESCRIPTION	*/
						 case 'd':
							 return replyCallback(
								    anime[ 0 ].synopsis.substring( 0, 196 ) )
							 break
						 /*	e == EPISODES	*/
						 case 'e':
							 return `Status: ${anime[ 0 ].status}
Episodes: ${anime[ 0 ].episodes}
Start date: ${moment( anime[ 0 ].start_date ).format( 'MMMM Do YYYY' )}
End date: ${moment( anime[ 0 ].end_date ).format( 'MMMM Do YYYY' )}`
							 break
						 /*	s == SYNONYMS	*/
						 case 's':
						 	 return verifyObject( anime[ 0 ].synonyms )
						 	 break
						/*	t == TORRENT	*/
						case 't':
							return torrent(title)
							break
						 default:
							 return 'Not Available'
					 }
				 } )
				 .catch( issue => {
					 console.log( "answerCallbackAnime: ", issue )
					 return 'Not Available'
				 })
}

function answerCallbackManga( button, title ) {
	return popura.searchMangas( title )
				 .then( manga => {
					 switch( button ) {
						 /*	d == DESCRIPTION	*/
						 case 'd':
							 return replyCallback(
								    manga[ 0 ].synopsis.substring( 0, 196 ) )
							 break
						 /*	s == STATUS	*/
						 case 's':
							 return manga[ 0 ].status
							 break
						 /*	v == VOLUMES	*/
						 case 'r':
							 return `Volumes: ${manga[ 0 ].volumes}\nChapters: ${manga[ 0 ].chapters}`
							 break
						 default:
							 return 'Not Available'
					 }
				 } )
				 .catch( issue => {
					 console.log( "answerCallbackManga: ", issue )
					 return 'Not Available'
				 })
}

function answerCallbackCharacter( title ) {
	return mal.quickSearch( title, 'character' )
			  .then( c => {
				  return c[ 0 ].fetch( )
				  			   .then( json => {
									 return replyCallback(
										  json.description.substring( 0, 196 ) )
								 } )
			  } )
}

bot.action( /.+/, ctx => {
	const result = ctx.match[ 0 ].split( "/" )

	switch( result[ 0 ] ) {
		/*	a == ANIME	*/
		case 'a':
			return answerCallbackAnime( result[ 1 ], result[ 2 ] )
			.then( data => ctx.answerCallbackQuery( data, undefined, true ) )
			.catch(error => console.log('[ERROR] bot.action anime: ', error))
			break
		/*	m == MANGA	*/
		case 'm':
			return answerCallbackManga( result[ 1 ], result[ 2 ] )
			.then( data => ctx.answerCallbackQuery( data, undefined, true ) )
			.catch(error => console.log('[ERROR] bot.action manga: ', error))
			break
		/*	c == CHARACTER	*/
		case 'c':
			return answerCallbackCharacter( result[ 1 ] )
			.then( data => ctx.answerCallbackQuery( data, undefined, true ) )
			.catch(error => console.log('[ERROR] bot.action character: ', error))
			break
		default:
			return ctx.answerCallbackQuery( 'Not Available', undefined, true )
	}
})

function replyButton( type, title ) {
	switch( type ) {
		case "anime":
			return Telegraf.Extra
				   .markdown( )
				   .markup( ( m ) => m.inlineKeyboard( [
					      m.callbackButton( 'Description',
						  `a/d/${title}`.substring( 0, 40 ) ),
						  m.callbackButton( 'Episodes',
						  `a/e/${title}`.substring( 0, 40 ) ),
						  m.callbackButton( 'Synonyms',
						  `a/s/${title}`.substring( 0, 40 ) )//,
						  //m.callbackButton( 'Torrent',
						  //`a/t/${title}`.substring( 0, 40 ) )
				   	  ] ) ).reply_markup
			break
		case "manga":
			return Telegraf.Extra
				   .markdown( )
				   .markup( ( m ) => m.inlineKeyboard( [
					      m.callbackButton( 'Description',
						  `m/d/${title}`.substring( 0, 40 ) ),
						  m.callbackButton( 'Status',
						  `m/s/${title}`.substring( 0, 40 ) ),
						  m.callbackButton( 'Releases',
						  `m/r/${title}`.substring( 0, 40 ) )
				   	  ] ) ).reply_markup
			break
		case "character":
			return Telegraf.Extra
				   .markdown( )
				   .markup( ( m ) => m.inlineKeyboard( [
					      m.callbackButton( 'Description',
						  `c/${title}`.substring( 0, 40 ) )
				   	  ] ) ).reply_markup
			break
		default:
			return null
	}
}

/*	Telegram  return  all  data  for  inline request as a JSON, replyInline only
	takes  all  info  recieved  through quickSearch and 'cleans it' to put it in
	Telegram standars
*/
function replyInline( data ) {
	const description = verifyData( data.description )

	return {
		id: data.id,
		title: '[' + data.type.toUpperCase() + '] ' + data.title,
		type: 'article',
		input_message_content: {
			message_text: replyMarkdown( data ),
			parse_mode: 'Markdown',
			disable_web_page_preview: false
		},
		reply_markup: replyButton( data.type, data.title ),
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
									thumb_url: 'http://bit.ly/2oj2nSy',
							  } ] )

	else
		return mal.quickSearch( search )
				  .then( array =>	__inlineSearch(	array.character.concat(
													array.anime.concat( array.manga ) ) ) )
				  .catch( issue => {
					  console.log( 'inlineSearch quickSearch: ', issue )
					   return [ {
									id: '0',
									title: 'Not Found',
									type: 'article',
									input_message_content: {
										message_text: "I couldn't find anything",
										parse_mode: 'Markdown'
									},
									description: "I couldn't find anything",
									thumb_url: 'http://bit.ly/2oj2nSy',
							  } ]
					})
}

bot.on( 'inline_query', ctx => {
	const search = messageToString( ctx.inlineQuery.query ) || ''

	inlineSearch( search )
	.then( results => ctx.answerInlineQuery( results ) )
	.catch( issue => console.log( 'inlineSearch: ', issue ) )
} )

bot.startPolling( )
