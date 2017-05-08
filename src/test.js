const HorribleSubsAPI = require('horriblesubs-api');
const horriblesubsAPI = new HorribleSubsAPI();

horriblesubsAPI.getAllAnime().then(res => {
  for(i in res) {
      if(res[i].title.toLowerCase() == 'eromanga-sensei') {
           horriblesubsAPI.getAnimeData(res[i])
                          .then(res => console.log(require('util').inspect(res, { depth: null })))        
           break
      }
  }
}).catch(err => console.error(err));
