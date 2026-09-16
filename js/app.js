var API_KEY='AIzaSyBZN1fX8QCV1zRQNkANXK2rhOgdnS9mIuk';
var WATCH_LATER_ID='_watch_later';
var BASE='https://raw.githubusercontent.com/noahgeoalta/noahtube/main/Playlist%20images/';
var BLOB_BASE='https://jsonblob.com/api/jsonBlob';
var CHANNEL_ADD={
  'PLQLYASJYnD3SbbkJXfLHlEiCDtVClnQO3':{type:'search',channelId:'UCSLkuZD3BR_4vujh_NKwm1w',query:'Warcraft',oldYears:8,titleFilter:/\b(3v3|4v4|5v5|6v6|8v8)\b/i,label:'WTiiWarcraft'},
  'PLQLYASJYnD3Rn7nN-A8fO-x6RrYwUcGnF':{type:'search',channelId:'UCQeRaTukNYft1_6AZPACnog',query:'World of Warcraft',oldYears:5,label:'Asmongold'},
  'PLQLYASJYnD3T-MrNTRFisyoLN3Bgk-sXe':{type:'channel',channelId:'UCf0ynO5nqkPq_7Xn-973d2w',label:'ArtosisCasts'},
  'PLQLYASJYnD3SKhk3dk91biYoLtI857xhG':{type:'channel',channelId:'UCo8fElL5iJdyf8gBP1ntjKA',label:'TheBaltazarTV'}
};
var SHUFFLE_IDS=['PLQLYASJYnD3SbbkJXfLHlEiCDtVClnQO3','PLQLYASJYnD3T-MrNTRFisyoLN3Bgk-sXe','PLQLYASJYnD3QBmKC_qDeN3iWd05lcXeFh','PLQLYASJYnD3SKhk3dk91biYoLtI857xhG'];
var BUILTIN_PLAYLISTS=[
  {id:'PLQLYASJYnD3SbbkJXfLHlEiCDtVClnQO3',name:'WarCraft III',thumb:BASE+'warcraftiii.jpg'},
  {id:'PLQLYASJYnD3Rn7nN-A8fO-x6RrYwUcGnF',name:'World of Warcraft',thumb:BASE+'wowgameplay.jpg'},
  {id:'PLQLYASJYnD3T-MrNTRFisyoLN3Bgk-sXe',name:'StarCraft',thumb:BASE+'starcraft.jpg'},
  {id:'PLQLYASJYnD3SKhk3dk91biYoLtI857xhG',name:'DOTA',thumb:BASE+'Dota.jpg'},
  {id:'PLQLYASJYnD3QBmKC_qDeN3iWd05lcXeFh',name:'Diablo I & II',thumb:BASE+'diablo.jpg'},
  {id:'PLQLYASJYnD3RdUMxUqIS2XdRpvEU5Nppy',name:'Elder Scrolls Books',thumb:BASE+'eso.jpg'},
  {id:'PLQLYASJYnD3TSKLynNvJaVxCpDwbBSMgq',name:'World of Warcraft OST',thumb:BASE+'wowost.jpg'},
  {id:'PLQLYASJYnD3RIXOqOow_gT9Pp0Kt4C9ty',name:'Warhammer',thumb:BASE+'Warhammer.jpg'}
];

var ytPlayer=null,currentVideos=[],currentIndex=0,currentPlaylistId=null;
var saveTimer=null,videoDurations={},preMuteVol=100;
var syncCode=localStorage.getItem('nt_sync_code')||null;
var syncTimer=null,adManual=false,adOverlayOn=false,dragSrcIdx=null;
var searchFilters={'no-shorts':true,'long':false,'hour':false};
var pendingAddVideoId=null,editingPlId=null,searchPlayQueue=[];
var currentTab='playlist',prevTab='playlist';

/* ── Tab / screen management ── */
function showTab(tab){
  currentTab=tab;
  document.getElementById('playlist-screen').style.display=tab==='playlist'?'block':'none';
  document.getElementById('history-screen').style.display=tab==='history'?'block':'none';
  document.getElementById('search-screen').style.display=tab==='search'?'block':'none';
  document.getElementById('player-screen').style.display='none';
  document.getElementById('nav-home').classList.toggle('active',tab==='playlist');
  document.getElementById('nav-history').classList.toggle('active',tab==='history');
  document.getElementById('nav-search').classList.toggle('active',tab==='search');
  renderTopHeader(tab);
  if(tab==='history')renderHistory();
  if(tab==='playlist')renderPlaylists();
  if(tab==='search'){
    setTimeout(function(){
      var inp=document.getElementById('search-input');
      if(inp){inp.focus();inp.select();}
    },150);
  }
}

function showPlayer(){
  document.getElementById('playlist-screen').style.display='none';
  document.getElementById('history-screen').style.display='none';
  document.getElementById('search-screen').style.display='none';
  document.getElementById('player-screen').style.display='flex';
  document.getElementById('nav-home').classList.remove('active');
  document.getElementById('nav-history').classList.remove('active');
  document.getElementById('nav-search').classList.remove('active');
  renderTopHeader('player');
}

/* Swap the top header toolbar content per tab */
function renderTopHeader(tab){
  var hdr=document.getElementById('top-header');
  if(tab==='playlist'){
    hdr.innerHTML='<div class="toolbar">'+
      '<button class="tb-btn gold" onclick="shufflePlay()">'+
        '<svg width="13" height="13" viewBox="0 0 14 14" fill="none">'+
          '<path d="M1 3h2.5a3 3 0 012.4 1.2L8 7l-2.1 2.8A3 3 0 013.5 11H1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'+
          '<path d="M13 3h-2.5a3 3 0 00-2.4 1.2L6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'+
          '<path d="M6 8l2.1 2.8A3 3 0 0010.5 11H13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'+
          '<path d="M11.5 1.5L13 3l-1.5 1.5M11.5 9.5L13 11l-1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>'+
        '</svg>Shuffle'+
      '</button>'+
      '<button class="tb-btn" onclick="openNewPlaylistModal()">+ Playlist</button>'+
      '<div class="search-bar" onclick="focusSearch()">'+
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.2"/><path d="M8 8l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'+
        '<input id="main-search-input" placeholder="Search YouTube..." onkeydown="if(event.key===\'Enter\')doSearch()">'+
      '</div>'+
      '<button class="tb-btn" id="sync-btn" onclick="openSyncModal()">'+
        '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 016.5 2a4.5 4.5 0 014.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M11 6.5A4.5 4.5 0 016.5 11 4.5 4.5 0 012 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 1L11 2.5 9.5 4M3.5 9L2 10.5l1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '<span id="sync-label">Sync</span>'+
      '</button>'+
    '</div>';
    if(syncCode)setSyncStatus('synced');
  } else if(tab==='search'){
    hdr.innerHTML='<div class="toolbar">'+
      '<button class="tb-btn" onclick="showTab(\'playlist\')">&#8592; Back</button>'+
      '<div class="search-bar">'+
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.2"/><path d="M8 8l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'+
        '<input id="search-input" placeholder="Search YouTube..." onkeydown="if(event.key===\'Enter\')doSearch()">'+
      '</div>'+
      '<button class="tb-btn gold" onclick="doSearch()">Go</button>'+
    '</div>';
  } else if(tab==='history'){
    hdr.innerHTML='';
  } else if(tab==='player'){
    hdr.innerHTML='';
  }
}

/* ── History ── */
function renderHistory(){
  var list=document.getElementById('history-list');
  var all=getAllPlaylists(),entries=[];
  all.forEach(function(pl){
    var wd=getWatchData(pl.id);
    if(!wd||(!(wd.currentIdx>0)&&!Object.keys(wd.videos||{}).length))return;
    var videos=wd.videos||{},lastVid=null,lastTime=0;
    Object.keys(videos).forEach(function(vid){if(videos[vid].updated>lastTime){lastTime=videos[vid].updated;lastVid=vid;}});
    var timeStr=lastVid&&videos[lastVid]?formatTime(videos[lastVid].time):'';
    entries.push({pl:pl,idx:wd.currentIdx||0,lastVid:lastVid,timeStr:timeStr,watchedAt:lastTime?new Date(lastTime):null,updated:lastTime||0});
  });
  entries.sort(function(a,b){return b.updated-a.updated;});
  /* merge in search history */
  var searchHist=lsGet('nt_search_hist')||[];
  searchHist.forEach(function(h){
    var sp=getSearchProgress(h.videoId);
    entries.push({
      pl:{id:'_search',name:'Search',thumb:h.thumbUrl},
      idx:0,lastVid:h.videoId,timeStr:sp&&sp.time?formatTime(sp.time):'',
      watchedAt:new Date(h.watched),updated:h.watched,
      isSearch:true,searchTitle:h.title,searchThumb:h.thumbUrl,searchVid:h.videoId
    });
  });
  entries.sort(function(a,b){return b.updated-a.updated;});
  if(!entries.length){list.innerHTML='<div class="history-empty">Nothing watched yet. Open a playlist to get started.</div>';return;}
  list.innerHTML=entries.map(function(e){
    var pl=e.pl,timeAgo='';
    if(e.watchedAt){var diff=Date.now()-e.watchedAt.getTime(),mins=Math.floor(diff/60000);if(mins<60)timeAgo=mins+'m ago';else if(mins<1440)timeAgo=Math.floor(mins/60)+'h ago';else timeAgo=Math.floor(mins/1440)+'d ago';}
    if(e.isSearch){
      return '<div class="history-item" onclick="replaySearchVideo(\''+escAttr(e.searchVid)+'\',\''+escAttr(e.searchTitle)+'\',\''+escAttr(e.searchThumb||'')+'\')">'+
        '<div class="hi-thumb">'+(e.searchThumb?'<img src="'+e.searchThumb+'" loading="lazy">':'')+'</div>'+
        '<div class="hi-info"><div class="hi-playlist" style="color:#7a9050;">Search</div>'+
        '<div class="hi-video">'+escHtml(e.searchTitle)+'</div>'+
        (e.timeStr?'<div class="hi-meta">at '+e.timeStr+(timeAgo?' &middot; '+timeAgo:'')+'</div>':(timeAgo?'<div class="hi-meta">'+timeAgo+'</div>':''))+
        '</div>'+
        '<button class="hi-resume" onclick="event.stopPropagation();replaySearchVideo(\''+escAttr(e.searchVid)+'\',\''+escAttr(e.searchTitle)+'\',\''+escAttr(e.searchThumb||'')+'\')">Resume</button>'+
      '</div>';
    }
    /* use stored video title/thumb if available */
    var videos=getWatchData(pl.id).videos||{};
    var vdata=e.lastVid&&videos[e.lastVid];
    var displayTitle=vdata&&vdata.title?vdata.title:('Video #'+(e.idx+1));
    var displayThumb=vdata&&vdata.thumb?vdata.thumb:pl.thumb;
    return '<div class="history-item" onclick="resumeFromHistory(\''+pl.id+'\',\''+escAttr(pl.name)+'\')">'+
      '<div class="hi-thumb">'+(displayThumb?'<img src="'+displayThumb+'" loading="lazy">':'')+'</div>'+
      '<div class="hi-info"><div class="hi-playlist">'+escHtml(pl.name)+'</div>'+
      '<div class="hi-video">'+escHtml(displayTitle)+'</div>'+
      (e.timeStr?'<div class="hi-meta">at '+e.timeStr+(timeAgo?' &middot; '+timeAgo:'')+'</div>':(timeAgo?'<div class="hi-meta">'+timeAgo+'</div>':''))+
      '</div>'+
      '<button class="hi-resume" onclick="event.stopPropagation();resumeFromHistory(\''+pl.id+'\',\''+escAttr(pl.name)+'\')">Resume</button>'+
    '</div>';
  }).join('');
}

function resumeFromHistory(plId,name){prevTab='history';openPlaylist(plId,name);}
function replaySearchVideo(videoId,title,thumbUrl){
  prevTab='history';
  currentPlaylistId=null;
  currentVideos=[{snippet:{resourceId:{videoId:videoId},title:title,thumbnails:thumbUrl?{default:{url:thumbUrl}}:{}}}];
  currentIndex=0;
  document.getElementById('player-title').textContent=title;
  document.getElementById('player-add-btn').classList.add('hidden');
  document.getElementById('vl-count').textContent='';
  document.getElementById('video-list').innerHTML='';
  showPlayer();adManual=false;setAdOverlay(false);
  var sp=getSearchProgress(videoId);
  playVideo(0,sp&&sp.time?sp.time:0);
}

/* ── Data helpers ── */
function getCustomPlaylists(){return lsGet('nt_custom_playlists')||[];}
function saveCustomPlaylists(arr){lsSet('nt_custom_playlists',arr);}
function getNameOverrides(){return lsGet('nt_name_overrides')||{};}
function saveNameOverrides(o){lsSet('nt_name_overrides',o);}
function getAllPlaylists(){
  var ov=getNameOverrides();
  var wl={id:WATCH_LATER_ID,name:'Watch Later',thumb:'',custom:false,watchLater:true};
  var b=BUILTIN_PLAYLISTS.map(function(pl){return{id:pl.id,name:ov[pl.id]||pl.name,thumb:pl.thumb,custom:false};});
  var c=getCustomPlaylists().map(function(pl){return{id:pl.id,name:ov[pl.id]||pl.name,thumb:pl.thumb||'',custom:true};});
  return [wl].concat(b).concat(c);
}

/* ── Watch Later ── */
function getWatchLaterVideos(){return lsGet('nt_watch_later')||[];}
function saveWatchLaterVideos(arr){lsSet('nt_watch_later',arr);}
function addToWatchLater(videoId,title,thumbUrl){
  var vids=getWatchLaterVideos();
  if(vids.some(function(v){return v.videoId===videoId;})){showToast('Already in Watch Later');return;}
  vids.push({videoId:videoId,title:title,thumbUrl:thumbUrl||'',added:Date.now()});
  saveWatchLaterVideos(vids);showToast('Added to Watch Later');
}
function removeFromWatchLater(videoId){
  var vids=getWatchLaterVideos().filter(function(v){return v.videoId!==videoId;});
  saveWatchLaterVideos(vids);
}
function wlToVideoItems(vids){
  return vids.map(function(v){
    var thumbs=v.thumbUrl?{default:{url:v.thumbUrl}}:{};
    return{snippet:{resourceId:{videoId:v.videoId},title:v.title,thumbnails:thumbs},_wl:true};
  });
}

/* ── Search history ── */
function saveSearchPlay(videoId,title,thumbUrl){
  var hist=lsGet('nt_search_hist')||[];
  hist=hist.filter(function(h){return h.videoId!==videoId;});
  hist.unshift({videoId:videoId,title:title,thumbUrl:thumbUrl||'',watched:Date.now()});
  lsSet('nt_search_hist',hist.slice(0,50));
}
function isBuiltin(plId){return BUILTIN_PLAYLISTS.some(function(p){return p.id===plId;});}
function lsGet(key){try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}}
function lsSet(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(e){}}
function getWatchData(plId){return lsGet('nt_'+plId)||{};}
function saveProgress(plId,idx,vidId,time,title,thumbUrl){
  if(!plId)return;
  var wd=getWatchData(plId);wd.currentIdx=idx;wd.videos=wd.videos||{};
  if(vidId&&time>5){
    var prev=wd.videos[vidId]||{};
    wd.videos[vidId]={time:time,updated:Date.now(),title:title||prev.title||'',thumb:thumbUrl||prev.thumb||''};
  }
  lsSet('nt_'+plId,wd);scheduleSyncPush();
}
function getVideoProgress(plId,vidId){if(!plId)return null;return getWatchData(plId).videos&&getWatchData(plId).videos[vidId]||null;}
function getSearchProgress(vidId){return lsGet('nt_sp_'+vidId)||null;}
function getRemovedIds(plId){return lsGet('nt_rm_'+plId)||[];}
function addRemovedId(plId,vidId){var rm=getRemovedIds(plId);if(rm.indexOf(vidId)===-1)rm.push(vidId);lsSet('nt_rm_'+plId,rm);scheduleSyncPush();}
function getAddedIds(plId){return lsGet('nt_add_'+plId)||[];}
function addAddedId(plId,vidId){var ad=getAddedIds(plId);if(ad.indexOf(vidId)!==-1)return false;ad.push(vidId);lsSet('nt_add_'+plId,ad);scheduleSyncPush();return true;}
function formatTime(s){if(!s)return '';return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
function yearsAgoRFC(n){var d=new Date();d.setFullYear(d.getFullYear()-n);return d.toISOString().replace(/\.\d{3}Z$/,'Z');}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escAttr(s){return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;');}
function decodeHtml(s){var t=document.createElement('textarea');t.innerHTML=String(s);return t.value;}
function clearHistory(){if(!confirm('Clear all watch history?'))return;try{var keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.startsWith('nt_'))keys.push(k);}keys.forEach(function(k){localStorage.removeItem(k);});}catch(e){}renderHistory();}

/* ── YouTube API ── */
window.onYouTubeIframeAPIReady=function(){};
(function(){var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);})();

async function fetchPlaylistInfo(id){
  var r=await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id='+id+'&key='+API_KEY);
  var d=await r.json();return d.items&&d.items[0]||null;
}
async function fetchPlaylistItems(id){
  var items=[],pageToken='';
  do{
    var r=await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId='+id+'&key='+API_KEY+(pageToken?'&pageToken='+pageToken:''));
    var d=await r.json();if(d.error)throw new Error(d.error.message);
    items=items.concat(d.items||[]);pageToken=d.nextPageToken||'';
  }while(pageToken);
  return items;
}
async function fetchChannelUploads(channelId){
  var r=await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id='+channelId+'&key='+API_KEY);
  var d=await r.json();
  var uploadsId=d.items&&d.items[0]&&d.items[0].contentDetails&&d.items[0].contentDetails.relatedPlaylists&&d.items[0].contentDetails.relatedPlaylists.uploads;
  if(!uploadsId)return[];
  var r2=await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId='+uploadsId+'&key='+API_KEY);
  var d2=await r2.json();return d2.items||[];
}
async function fetchChannelSearch(channelId,query,oldYears){
  var url='https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId='+channelId+'&q='+encodeURIComponent(query)+'&maxResults=50&order=date&key='+API_KEY;
  if(oldYears)url+='&publishedBefore='+encodeURIComponent(yearsAgoRFC(oldYears));
  var r=await fetch(url);var d=await r.json();
  if(!d.items)return[];
  return d.items.map(function(it){
    return{snippet:{resourceId:{videoId:it.id&&it.id.videoId},title:it.snippet&&it.snippet.title,thumbnails:it.snippet&&it.snippet.thumbnails||{}}};
  }).filter(function(it){return it.snippet.resourceId.videoId;});
}

/* ── Search ── */
async function doSearch(){
  var mainInp=document.getElementById('main-search-input');
  var searchInp=document.getElementById('search-input');
  var q=((searchInp&&searchInp.value)||(mainInp&&mainInp.value)||'').trim();
  if(!q){showToast('Enter a search term');return;}
  showTab('search');
  setTimeout(function(){
    var inp=document.getElementById('search-input');
    if(inp){inp.value=q;inp.focus();}
    if(mainInp)mainInp.value=q;
  },10);
  var container=document.getElementById('search-results-container');
  container.innerHTML='<div class="search-loading">Searching...</div>';
  try{
    var durParam=searchFilters['hour']?'&videoDuration=long':'';
    var url='https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q='+encodeURIComponent(q)+'&maxResults=50&order=relevance&key='+API_KEY+durParam;
    var r=await fetch(url);var d=await r.json();if(d.error)throw new Error(d.error.message);
    var items=d.items||[];
    if(searchFilters['no-shorts']){items=items.filter(function(it){var t=it.snippet&&it.snippet.title||'';return!/#shorts/i.test(t)&&!/\bshorts\b/i.test(t);});}
    var videoIds=items.map(function(it){return it.id&&it.id.videoId;}).filter(Boolean);
    var durMap={};
    if(videoIds.length){
      var dr=await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+videoIds.join(',')+'&key='+API_KEY);
      var dd=await dr.json();
      (dd.items||[]).forEach(function(it){var d2=it.contentDetails&&it.contentDetails.duration||'';var m=d2.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);if(m){var secs=(parseInt(m[1]||0)*3600)+(parseInt(m[2]||0)*60)+(parseInt(m[3]||0));durMap[it.id]=secs;}});
      items=items.filter(function(it){var vid=it.id&&it.id.videoId,secs=durMap[vid]||999999;if(searchFilters['no-shorts']&&secs<62)return false;if(searchFilters['hour']&&secs<3600)return false;if(searchFilters['long']&&!searchFilters['hour']&&secs<1200)return false;return true;});
    }
    searchPlayQueue=items;
    if(!items.length){container.innerHTML='<div class="search-empty">No results found.</div>';return;}
    container.innerHTML='<div class="search-results">'+items.map(function(it,i){
      var vid=it.id&&it.id.videoId,title=decodeHtml(it.snippet&&it.snippet.title||''),channel=decodeHtml(it.snippet&&it.snippet.channelTitle||'');
      var thumb=it.snippet&&it.snippet.thumbnails&&(it.snippet.thumbnails.medium||it.snippet.thumbnails.default);
      var thumbUrl=thumb&&thumb.url||'',secs=durMap[vid],durStr=secs?formatTime(secs):'';
      return '<div class="sr-item" onclick="playFromSearch('+i+')">'+'<div class="sr-thumb">'+(thumbUrl?'<img src="'+thumbUrl+'" loading="lazy">':'')+'<div class="sr-play-overlay"><div class="sr-play-icon"><svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M1 1l8 5-8 5V1z" fill="#1a0f08"/></svg></div></div></div>'+'<div class="sr-info"><div class="sr-title">'+escHtml(title)+'</div><div class="sr-channel">'+escHtml(channel)+(durStr?' &middot; '+durStr:'')+'</div><div class="sr-actions"><button class="sr-add-btn" onclick="event.stopPropagation();addToWatchLater(\''+vid+'\',\''+escAttr(title)+'\',\''+escAttr(thumbUrl)+'\')">Watch Later</button><button class="sr-add-btn" onclick="event.stopPropagation();openAddToPlaylist(\''+vid+'\',\''+escAttr(title)+'\',\''+escAttr(thumbUrl)+'\')">+ Playlist</button></div></div></div>';
    }).join('')+'</div>';
  }catch(e){container.innerHTML='<div class="search-empty">Search failed: '+escHtml(e.message)+'</div>';}
}

function playFromSearch(idx){
  var it=searchPlayQueue[idx];if(!it)return;
  var vid=it.id&&it.id.videoId,title=decodeHtml(it.snippet&&it.snippet.title||'Search result');
  var thumbObj=it.snippet&&it.snippet.thumbnails&&(it.snippet.thumbnails.medium||it.snippet.thumbnails.default);
  var thumbUrl=thumbObj&&thumbObj.url||'';
  saveSearchPlay(vid,title,thumbUrl);
  prevTab='search';currentPlaylistId=null;
  currentVideos=[{snippet:{resourceId:{videoId:vid},title:title,thumbnails:it.snippet&&it.snippet.thumbnails||{}}}];
  currentIndex=0;
  document.getElementById('player-title').textContent=title;
  document.getElementById('player-add-btn').classList.add('hidden');
  document.getElementById('vl-count').textContent='';document.getElementById('video-list').innerHTML='';
  showPlayer();
  adManual=false;setAdOverlay(false);playVideo(0,0);
}

function toggleFilter(f){
  if(f==='long'||f==='hour'){if(searchFilters[f]){searchFilters[f]=false;}else{searchFilters['long']=false;searchFilters['hour']=false;searchFilters[f]=true;}}
  else{searchFilters[f]=!searchFilters[f];}
  document.getElementById('fc-no-shorts').classList.toggle('active',searchFilters['no-shorts']);
  document.getElementById('fc-long').classList.toggle('active',searchFilters['long']);
  document.getElementById('fc-hour').classList.toggle('active',searchFilters['hour']);
}

function focusSearch(){
  showTab('search');
}

function openAddToPlaylist(vid,title,thumbUrl){
  pendingAddVideoId=vid;
  var sel=document.getElementById('add-to-pl-select');
  sel.innerHTML=getAllPlaylists().filter(function(pl){return pl.id!==WATCH_LATER_ID;}).map(function(pl){return'<option value="'+pl.id+'">'+escHtml(pl.name)+'</option>';}).join('');
  openModal('add-to-pl-modal');
}
function confirmAddToPlaylist(){var plId=document.getElementById('add-to-pl-select').value;if(!plId||!pendingAddVideoId)return;var ok=addAddedId(plId,pendingAddVideoId);closeModal('add-to-pl-modal');showToast(ok?'Added to playlist':'Already in that playlist');}

/* ── Playlist management ── */
function openNewPlaylistModal(){openModal('new-pl-modal');}
async function addCustomPlaylist(){
  var raw=document.getElementById('new-pl-id').value.trim(),name=document.getElementById('new-pl-name').value.trim();
  if(!raw){showToast('Enter a playlist ID or URL');return;}
  var id=raw,m=raw.match(/[?&]list=([^&]+)/);if(m)id=m[1];
  showToast('Verifying...');var info=null;try{info=await fetchPlaylistInfo(id);}catch(e){}
  if(!info){showToast('Playlist not found or not public');return;}
  var finalName=name||(info.snippet&&info.snippet.title)||id;
  var customs=getCustomPlaylists();
  if(customs.some(function(p){return p.id===id;})||BUILTIN_PLAYLISTS.some(function(p){return p.id===id;})){showToast('Playlist already added');closeModal('new-pl-modal');return;}
  customs.push({id:id,name:finalName,thumb:''});saveCustomPlaylists(customs);
  document.getElementById('new-pl-id').value='';document.getElementById('new-pl-name').value='';
  closeModal('new-pl-modal');showToast('Playlist added: '+finalName);renderPlaylists();
}
function openEditPlaylist(plId){
  editingPlId=plId;
  var pl=getAllPlaylists().find(function(p){return p.id===plId;});
  document.getElementById('edit-pl-name').value=pl?pl.name:'';
  openModal('edit-pl-modal');
}
function saveEditPlaylist(){var name=document.getElementById('edit-pl-name').value.trim();if(!name){showToast('Enter a name');return;}var ov=getNameOverrides();ov[editingPlId]=name;saveNameOverrides(ov);closeModal('edit-pl-modal');showToast('Renamed');renderPlaylists();}
function deletePlaylist(){if(isBuiltin(editingPlId)){showToast("Can't delete built-in playlists");return;}var customs=getCustomPlaylists().filter(function(p){return p.id!==editingPlId;});saveCustomPlaylists(customs);var ov=getNameOverrides();delete ov[editingPlId];saveNameOverrides(ov);closeModal('edit-pl-modal');showToast('Playlist removed');renderPlaylists();}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

var toastTimer=null;
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show');},2600);}

/* ── Sync ── */
function getBlobId(){
  if(!syncCode)return null;
  var stored=localStorage.getItem('nt_blob_'+syncCode);
  if(stored)return stored;
  /* NT-XXXXX codes encode the blob ID in base36 — decode it so any device works */
  if(/^NT-[0-9A-Z]+$/i.test(syncCode)){
    try{var id=parseInt(syncCode.slice(3),36).toString();if(id&&id!=='NaN'){localStorage.setItem('nt_blob_'+syncCode,id);return id;}}catch(e){}
  }
  return null;
}
function gatherAllData(){var out={};getAllPlaylists().forEach(function(pl){var wd=lsGet('nt_'+pl.id),rm=lsGet('nt_rm_'+pl.id),ad=lsGet('nt_add_'+pl.id);if(wd||rm||ad)out[pl.id]={wd:wd||{},rm:rm||[],ad:ad||[]};});return out;}
function applyRemoteData(data){
  if(!data||typeof data!=='object')return;
  Object.keys(data).forEach(function(plId){
    var remote=data[plId];if(!remote)return;
    var local=lsGet('nt_'+plId)||{};
    if(remote.wd){var merged=Object.assign({},local);merged.videos=Object.assign({},local.videos||{});var rv=remote.wd.videos||{};Object.keys(rv).forEach(function(vid){var lv=merged.videos[vid];if(!lv||rv[vid].updated>lv.updated)merged.videos[vid]=rv[vid];});if(remote.wd.currentIdx!=null&&(merged.currentIdx==null||remote.wd.currentIdx>merged.currentIdx))merged.currentIdx=remote.wd.currentIdx;lsSet('nt_'+plId,merged);}
    if(remote.rm){var lr=lsGet('nt_rm_'+plId)||[],mr=lr.slice();remote.rm.forEach(function(v){if(mr.indexOf(v)===-1)mr.push(v);});lsSet('nt_rm_'+plId,mr);}
    if(remote.ad){var la=lsGet('nt_add_'+plId)||[],ma=la.slice();remote.ad.forEach(function(v){if(ma.indexOf(v)===-1)ma.push(v);});lsSet('nt_add_'+plId,ma);}
  });
}
async function syncPush(){
  if(!syncCode)return;
  var data=gatherAllData(),blobId=getBlobId();
  try{
    if(!blobId){var r=await fetch(BLOB_BASE,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});if(r.ok){var loc=r.headers.get('location')||r.url;blobId=loc.split('/').pop();localStorage.setItem('nt_blob_'+syncCode,blobId);setSyncStatus('synced');}}
    else{await fetch(BLOB_BASE+'/'+blobId,{method:'PUT',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});setSyncStatus('synced');}
  }catch(e){setSyncStatus('err');}
}
async function syncPull(){
  if(!syncCode)return;var blobId=getBlobId();if(!blobId)return;
  try{setSyncStatus('syncing');var r=await fetch(BLOB_BASE+'/'+blobId,{headers:{'Accept':'application/json'}});if(!r.ok){setSyncStatus('err');return;}var data=await r.json();applyRemoteData(data);setSyncStatus('synced');showToast('Watch data synced');}
  catch(e){setSyncStatus('err');}
}
function scheduleSyncPush(){if(syncTimer)clearTimeout(syncTimer);syncTimer=setTimeout(syncPush,3000);}
function setSyncStatus(s){
  var btn=document.getElementById('sync-btn'),lbl=document.getElementById('sync-label');
  if(!btn)return;
  btn.className='tb-btn'+(s==='synced'?' synced':s==='syncing'?' syncing':'');
  lbl.textContent=s==='synced'?syncCode:s==='syncing'?'Syncing...':'Sync';
}
function openSyncModal(){document.getElementById('sync-code-input').value=syncCode||'';openModal('sync-modal');}
function closeSyncModal(){closeModal('sync-modal');}
async function generateNewCode(){
  var inp=document.getElementById('sync-code-input');
  inp.value='Creating...';inp.disabled=true;
  try{
    var r=await fetch(BLOB_BASE,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({})});
    if(!r.ok)throw new Error('failed');
    var loc=r.headers.get('location')||r.url;
    var blobId=loc.split('/').pop();
    var code='NT-'+parseInt(blobId).toString(36).toUpperCase();
    inp.value=code;
    localStorage.setItem('nt_blob_'+code,blobId);
  }catch(e){
    var w=['ORC','ELF','HERO','RUNE','BLADE','STORM','ZERG','TAUREN','DEMON','GRYPHON'];
    inp.value=w[Math.floor(Math.random()*w.length)]+'-'+Math.floor(1000+Math.random()*8999);
  }finally{inp.disabled=false;}
}
async function applySyncCode(){
  var val=document.getElementById('sync-code-input').value.trim();
  if(!val){showToast('Enter a sync code first');return;}
  syncCode=val;localStorage.setItem('nt_sync_code',syncCode);
  closeSyncModal();setSyncStatus('syncing');
  var blobId=getBlobId();
  if(blobId){await syncPull();}
  else{await syncPush();}
  setSyncStatus('synced');renderPlaylists();
}
function clearSyncCode(){syncCode=null;localStorage.removeItem('nt_sync_code');closeSyncModal();setSyncStatus('off');showToast('Sync cleared');}

/* ── Playlist grid ── */
async function renderPlaylists(){
  var grid=document.getElementById('playlist-grid');grid.innerHTML='<div class="loading">Loading...</div>';
  var all=getAllPlaylists();
  var cards=await Promise.all(all.map(async function(pl){
    try{
      var info=await fetchPlaylistInfo(pl.id);
      var added=getAddedIds(pl.id).length,removed=getRemovedIds(pl.id).length;
      var base=parseInt(info&&info.contentDetails&&info.contentDetails.itemCount||0);
      var count=Math.max(0,base+added-removed)||'?';
      var wd=getWatchData(pl.id);var hasProgress=(wd.currentIdx>0)||Object.keys(wd.videos||{}).length>0;
      return{pl:pl,count:count,hasProgress:hasProgress,currentIdx:wd.currentIdx||0};
    }catch(e){return{pl:pl,count:'?',hasProgress:false,currentIdx:0};}
  }));
  /* Watch Later card (rendered separately, no API call needed) */
  var wlVids=getWatchLaterVideos();
  var wlThumbsHtml='';
  var wlSlice=wlVids.slice(0,4);
  for(var wi=0;wi<4;wi++){var wv=wlSlice[wi];wlThumbsHtml+=wv&&wv.thumbUrl?'<img src="'+wv.thumbUrl+'" loading="lazy">':'<div class="wl-empty"></div>';}
  var wlCard='<div class="playlist-card" onclick="openPlaylist(\''+WATCH_LATER_ID+'\',\'Watch Later\')">'+
    '<div class="card-thumb" style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1px;background:#0a0603;">'+wlThumbsHtml+
    '<div class="wl-card-count" style="position:absolute;bottom:5px;right:6px;background:rgba(0,0,0,0.78);color:#bbb;font-size:10px;padding:2px 5px;border-radius:2px;">'+wlVids.length+'</div>'+
    '</div>'+
    '<div class="card-body"><div class="card-title">Watch Later</div>'+
    '<div class="card-sub">'+(wlVids.length?wlVids.length+' saved':'Empty')+'</div></div></div>';

  grid.innerHTML=wlCard+cards.filter(function(c){return c.pl.id!==WATCH_LATER_ID;}).map(function(c){
    var pl=c.pl,hasAdd=!!CHANNEL_ADD[pl.id];
    return '<div class="playlist-card" onclick="openPlaylist(\''+pl.id+'\',\''+escAttr(pl.name)+'\')">'+
      '<div class="card-thumb">'+(pl.thumb?'<img src="'+pl.thumb+'" alt="" loading="lazy">':'')+
      '<div class="card-count"><svg width="10" height="8" viewBox="0 0 11 9" fill="none"><rect y="0" width="11" height="1.5" fill="currentColor"/><rect y="3.5" width="8" height="1.5" fill="currentColor"/><rect y="7" width="9" height="1.5" fill="currentColor"/></svg>'+c.count+'</div>'+
      (c.hasProgress?'<div class="resume-dot"></div>':'')+
      (hasAdd?'<button class="card-add-btn" onclick="event.stopPropagation();quickAdd(\''+pl.id+'\')" title="Add random video">+</button>':'')+
      '<button class="card-menu-btn" onclick="event.stopPropagation();openEditPlaylist(\''+pl.id+'\')" title="Edit">&#8943;</button>'+
      '</div><div class="card-body"><div class="card-title">'+escHtml(pl.name)+'</div>'+
      '<div class="card-sub">'+(c.hasProgress?'Resume &middot; #'+(c.currentIdx+1):'')+'</div></div></div>';
  }).join('');
  if(syncCode)setSyncStatus('synced');
}

async function quickAdd(plId){showToast('Finding a video...');await doAddRandomVideo(plId);renderPlaylists();}

async function shufflePlay(){
  showToast('Loading shuffle...');
  try{
    var plId=SHUFFLE_IDS[Math.floor(Math.random()*SHUFFLE_IDS.length)];
    var pl=getAllPlaylists().find(function(p){return p.id===plId;});
    var items=await fetchPlaylistItems(plId);
    var rm=getRemovedIds(plId);
    var valid=items.filter(function(it){var vid=it.snippet&&it.snippet.resourceId&&it.snippet.resourceId.videoId;return vid&&rm.indexOf(vid)===-1&&it.snippet.title!=='Private video'&&it.snippet.title!=='Deleted video';});
    if(!valid.length){showToast('No videos available');return;}
    var idx=Math.floor(Math.random()*valid.length);
    prevTab='playlist';currentPlaylistId=plId;currentVideos=valid;currentIndex=idx;
    document.getElementById('player-title').textContent='Shuffle: '+(pl?pl.name:'');
    showPlayer();
    updateAddBtn();
    document.getElementById('vl-count').textContent=valid.length+' videos';
    renderVideoList();playVideo(idx,0);
  }catch(e){showToast('Shuffle failed: '+e.message);}
}

async function openPlaylist(plId,name){
  prevTab=currentTab;currentPlaylistId=plId;
  document.getElementById('player-title').textContent=name;
  document.getElementById('video-list').innerHTML='<div style="padding:20px;text-align:center;font-size:11px;color:#5a4020;">Loading...</div>';
  showPlayer();
  updateAddBtn();adManual=false;setAdOverlay(false);
  if(plId===WATCH_LATER_ID){loadWatchLaterPlaylist();return;}
  try{await reloadPlaylist(true);}
  catch(e){document.getElementById('video-list').innerHTML='<div style="padding:20px;text-align:center;font-size:11px;color:#884444;">Failed: '+escHtml(e.message)+'</div>';}
}

function loadWatchLaterPlaylist(){
  var vids=getWatchLaterVideos();
  currentVideos=wlToVideoItems(vids);
  document.getElementById('vl-count').textContent=currentVideos.length+' videos';
  document.getElementById('player-add-btn').classList.add('hidden');
  renderVideoList();
  if(currentVideos.length>0)playVideo(0,null);
  else document.getElementById('video-list').innerHTML='<div style="padding:30px;text-align:center;font-size:11px;color:#5a4020;">No videos saved yet. Search and tap Watch Later.</div>';
}

async function reloadPlaylist(autoPlay){
  var plId=currentPlaylistId;var items=await fetchPlaylistItems(plId);var rm=getRemovedIds(plId),addedIds=getAddedIds(plId);
  var filtered=items.filter(function(it){var vid=it.snippet&&it.snippet.resourceId&&it.snippet.resourceId.videoId;return vid&&rm.indexOf(vid)===-1&&it.snippet.title!=='Private video'&&it.snippet.title!=='Deleted video';});
  addedIds.forEach(function(vid){if(!filtered.find(function(it){return it.snippet&&it.snippet.resourceId&&it.snippet.resourceId.videoId===vid;}))filtered.push({snippet:{resourceId:{videoId:vid},title:'(Added video)',thumbnails:{}},_added:true});});
  var order=lsGet('nt_order_'+plId);
  if(order&&order.length){var byId={};filtered.forEach(function(v){var id=v.snippet&&v.snippet.resourceId&&v.snippet.resourceId.videoId;if(id)byId[id]=v;});var ordered=order.map(function(id){return byId[id];}).filter(Boolean);var remaining=filtered.filter(function(v){var id=v.snippet&&v.snippet.resourceId&&v.snippet.resourceId.videoId;return id&&order.indexOf(id)===-1;});filtered=ordered.concat(remaining);}
  currentVideos=filtered;var wd=getWatchData(plId);
  if(autoPlay)currentIndex=wd.currentIdx?Math.min(wd.currentIdx,currentVideos.length-1):0;
  document.getElementById('vl-count').textContent=currentVideos.length+' videos';renderVideoList();
  if(autoPlay){var vidId=currentVideos[currentIndex]&&currentVideos[currentIndex].snippet&&currentVideos[currentIndex].snippet.resourceId&&currentVideos[currentIndex].snippet.resourceId.videoId;var vp=vidId?getVideoProgress(plId,vidId):null;playVideo(currentIndex,vp&&vp.time?vp.time:0);}
}

function updateAddBtn(){
  var btn=document.getElementById('player-add-btn');
  var cfg=currentPlaylistId&&CHANNEL_ADD[currentPlaylistId];
  if(cfg){btn.classList.remove('hidden');btn.textContent='+ '+cfg.label+' video';}
  else btn.classList.add('hidden');
}

async function doAddRandomVideo(plId){
  var cfg=CHANNEL_ADD[plId];if(!cfg)return;
  try{
    var videos=cfg.type==='search'?await fetchChannelSearch(cfg.channelId,cfg.query,cfg.oldYears):await fetchChannelUploads(cfg.channelId);
    if(!videos.length){showToast('No videos found');return;}
    var rm=getRemovedIds(plId),existing=[];
    try{var ei=await fetchPlaylistItems(plId);ei.forEach(function(it){var v=it.snippet&&it.snippet.resourceId&&it.snippet.resourceId.videoId;if(v)existing.push(v);});}catch(e){}
    existing=existing.concat(getAddedIds(plId));
    var candidates=videos.filter(function(v){var vid=v.snippet&&v.snippet.resourceId&&v.snippet.resourceId.videoId;var title=v.snippet&&v.snippet.title||'';if(!vid||existing.indexOf(vid)!==-1||rm.indexOf(vid)!==-1)return false;if(cfg.titleFilter&&!cfg.titleFilter.test(title))return false;return true;});
    if(!candidates.length){showToast('No matching videos found');return;}
    var pick=candidates[Math.floor(Math.random()*candidates.length)];
    var vid=pick.snippet&&pick.snippet.resourceId&&pick.snippet.resourceId.videoId;
    var title=pick.snippet&&pick.snippet.title||vid;
    var ok=addAddedId(plId,vid);
    if(ok)showToast('Added: '+title.substring(0,38)+(title.length>38?'...':''));
    else showToast('Already in playlist');
  }catch(e){showToast('Failed to add video');}
}
async function addRandomVideo(){if(!currentPlaylistId)return;await doAddRandomVideo(currentPlaylistId);await reloadPlaylist(false);}

/* ── Video list ── */
function removeVideo(idx){
  var v=currentVideos[idx];var vidId=v&&v.snippet&&v.snippet.resourceId&&v.snippet.resourceId.videoId;if(!vidId)return;
  if(currentPlaylistId===WATCH_LATER_ID){removeFromWatchLater(vidId);}
  else{addRemovedId(currentPlaylistId,vidId);}
  if(currentPlaylistId!==WATCH_LATER_ID){var ad=getAddedIds(currentPlaylistId).filter(function(id){return id!==vidId;});lsSet('nt_add_'+currentPlaylistId,ad);}
  var wasActive=idx===currentIndex;currentVideos.splice(idx,1);
  if(wasActive&&currentVideos.length>0){currentIndex=Math.min(idx,currentVideos.length-1);playVideo(currentIndex,0);}
  else if(currentIndex>idx)currentIndex--;
  document.getElementById('vl-count').textContent=currentVideos.length+' videos';renderVideoList();showToast('Video removed');
}
function jumpToCurrent(){var el=document.getElementById('vi-'+currentIndex);if(el)el.scrollIntoView({block:'center',behavior:'smooth'});}
function renderVideoList(){
  var plId=currentPlaylistId;
  document.getElementById('video-list').innerHTML=currentVideos.map(function(v,i){
    var s=v.snippet;var thumb=(s&&s.thumbnails&&(s.thumbnails.default||s.thumbnails.medium))?((s.thumbnails.default||s.thumbnails.medium).url||''):'';
    var vidId=s&&s.resourceId&&s.resourceId.videoId;var vp=vidId?getVideoProgress(plId,vidId):null;var dur=vidId?videoDurations[vidId]:null;var pct=(vp&&dur)?Math.min(100,(vp.time/dur)*100):0;var timeStr=vp?formatTime(vp.time):'';
    return '<div class="video-item'+(i===currentIndex?' active':'')+'" id="vi-'+i+'" draggable="true" ondragstart="dragStart(event,'+i+')" ondragover="dragOver(event,'+i+')" ondrop="dragDrop(event,'+i+')" ondragend="dragEnd(event)" onclick="playVideo('+i+',0)">'+
      '<div class="vi-drag" onclick="event.stopPropagation()">&#9776;</div>'+
      '<div class="vi-num">'+(i+1)+'</div>'+
      '<div class="vi-thumb">'+(thumb?'<img src="'+thumb+'" loading="lazy">':'')+(pct>1?'<div class="vi-progress" style="width:'+pct+'%"></div>':'')+'</div>'+
      '<div class="vi-info"><div class="vi-title">'+(s&&s.title?escHtml(s.title):'')+'</div>'+(timeStr?'<div class="vi-watched">at '+timeStr+'</div>':'')+'</div>'+
      '<button class="vi-remove" onclick="event.stopPropagation();removeVideo('+i+')" title="Remove">&#215;</button>'+
    '</div>';
  }).join('');
  setTimeout(function(){var el=document.getElementById('vi-'+currentIndex);if(el)el.scrollIntoView({block:'nearest'});},80);
}
function updateActive(idx){
  document.querySelectorAll('.video-item').forEach(function(el,i){el.classList.toggle('active',i===idx);});
  var el=document.getElementById('vi-'+idx);if(el)el.scrollIntoView({block:'nearest',behavior:'smooth'});
}

/* ── Drag & drop ── */
function dragStart(e,idx){dragSrcIdx=idx;e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move';}
function dragOver(e,idx){e.preventDefault();e.dataTransfer.dropEffect='move';document.querySelectorAll('.video-item').forEach(function(el){el.classList.remove('drag-over');});var el=document.getElementById('vi-'+idx);if(el)el.classList.add('drag-over');}
function dragDrop(e,idx){e.preventDefault();if(dragSrcIdx===null||dragSrcIdx===idx)return;var moved=currentVideos.splice(dragSrcIdx,1)[0];currentVideos.splice(idx,0,moved);if(currentIndex===dragSrcIdx)currentIndex=idx;else if(dragSrcIdx<currentIndex&&idx>=currentIndex)currentIndex--;else if(dragSrcIdx>currentIndex&&idx<=currentIndex)currentIndex++;var allVids=currentVideos.map(function(v){return v.snippet&&v.snippet.resourceId&&v.snippet.resourceId.videoId;}).filter(Boolean);lsSet('nt_order_'+currentPlaylistId,allVids);renderVideoList();}
function dragEnd(e){dragSrcIdx=null;document.querySelectorAll('.video-item').forEach(function(el){el.classList.remove('dragging','drag-over');});}

/* ── Ad overlay ── */
function setAdOverlay(on){
  adOverlayOn=on;var overlay=document.getElementById('ad-overlay'),btn=document.getElementById('ad-toggle-btn');
  if(on){overlay.classList.add('active');btn.classList.add('active');try{preMuteVol=ytPlayer.getVolume();ytPlayer.mute();}catch(e){}}
  else{overlay.classList.remove('active');btn.classList.remove('active');try{ytPlayer.unMute();ytPlayer.setVolume(preMuteVol);}catch(e){}}}
var adAutoTimer=null;
function toggleAdManual(){
  adManual=!adManual;setAdOverlay(adManual);
  if(adAutoTimer){clearTimeout(adAutoTimer);adAutoTimer=null;}
  if(adManual){adAutoTimer=setTimeout(function(){adManual=false;setAdOverlay(false);adAutoTimer=null;},8000);}
}

/* ── Player ── */
function playVideo(idx,startTime){
  currentIndex=idx;updateActive(idx);
  var videoId=currentVideos[idx]&&currentVideos[idx].snippet&&currentVideos[idx].snippet.resourceId&&currentVideos[idx].snippet.resourceId.videoId;
  if(!videoId)return;
  if(!startTime&&currentPlaylistId){var vp=getVideoProgress(currentPlaylistId,videoId);if(vp)startTime=vp.time;}
  if(ytPlayer&&ytPlayer.loadVideoById){ytPlayer.loadVideoById({videoId:videoId,startSeconds:startTime||0});}
  else if(window.YT&&window.YT.Player){
    try{if(ytPlayer)ytPlayer.destroy();}catch(e){}
    ytPlayer=new YT.Player('yt-player',{videoId:videoId,playerVars:{autoplay:1,start:Math.floor(startTime||0),rel:0,modestbranding:1,playsinline:1},events:{
      onStateChange:function(e){if(e.data===0&&currentIndex<currentVideos.length-1)playVideo(currentIndex+1,0);},
      onReady:function(e){e.target.playVideo();var dur=e.target.getDuration();if(dur)videoDurations[videoId]=dur;}
    }});
  }else{setTimeout(function(){playVideo(idx,startTime);},500);}
  startSaveTimer();
}

function startSaveTimer(){
  if(saveTimer)clearInterval(saveTimer);
  saveTimer=setInterval(function(){
    try{
      var time=ytPlayer&&ytPlayer.getCurrentTime?ytPlayer.getCurrentTime():null;
      var dur=ytPlayer&&ytPlayer.getDuration?ytPlayer.getDuration():null;
      var v=currentVideos[currentIndex];
      var s=v&&v.snippet;
      var videoId=s&&s.resourceId&&s.resourceId.videoId;
      var title=s&&s.title||'';
      var thumbObj=s&&s.thumbnails&&(s.thumbnails.default||s.thumbnails.medium);
      var thumbUrl=thumbObj&&thumbObj.url||'';
      if(time&&time>5&&!adOverlayOn){
        if(dur&&videoId)videoDurations[videoId]=dur;
        if(currentPlaylistId){
          saveProgress(currentPlaylistId,currentIndex,videoId,time,title,thumbUrl);
          var vi=document.getElementById('vi-'+currentIndex);
          if(vi&&dur){var bar=vi.querySelector('.vi-progress');if(!bar){bar=document.createElement('div');bar.className='vi-progress';var th=vi.querySelector('.vi-thumb');if(th)th.appendChild(bar);}if(bar)bar.style.width=Math.min(100,(time/dur)*100)+'%';var w=vi.querySelector('.vi-watched');if(!w){w=document.createElement('div');w.className='vi-watched';var inf=vi.querySelector('.vi-info');if(inf)inf.appendChild(w);}if(w)w.textContent='at '+formatTime(time);}
        } else if(videoId){
          lsSet('nt_sp_'+videoId,{time:time,updated:Date.now()});
        }
      }
    }catch(e){}
  },5000);
}

function goBack(){
  if(saveTimer)clearInterval(saveTimer);adManual=false;setAdOverlay(false);
  try{if(ytPlayer)ytPlayer.pauseVideo();}catch(e){}
  showTab(prevTab||'playlist');
}

/* ── Init ── */
renderTopHeader('playlist');
renderPlaylists();
if(syncCode){setSyncStatus('syncing');syncPull();}
document.querySelectorAll('.modal-bg').forEach(function(el){
  el.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
});
