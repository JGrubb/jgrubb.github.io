"use strict";angular.module("archiveApp",["ui.router","LocalStorageModule","chieffancypants.loadingBar","infinite-scroll","underscore"]).config(["$stateProvider","$urlRouterProvider",function(a){a.state("home",{url:"/",templateUrl:"views/main.html"}).state("list",{url:"/:collection",templateUrl:"views/list.html",controller:"ListController"}).state("detail",{url:"/detail/:id",templateUrl:"views/detail.html",controller:"DetailController"})}]);var underscore=angular.module("underscore",[]);underscore.factory("_",function(){return window._}),angular.module("archiveApp").controller("MainController",["$scope","Archive","Playlist",function(a,b,c){b.getIndex().then(function(b){a.bands=b}),a.playlist=c.playlist,console.log(c.playlist),a.clearPlaylist=c.clearPlaylist,a.limit=60,a.loadMore=function(){a.limit+=60},console.log(a)}]),angular.module("archiveApp").factory("Archive",["$http","$q","localStorageService",function(a,b,c){var d=c,e="https://archive.org/advancedsearch.php",f="https://archive.org/details/",g=function(){var c=b.defer();return d.get("idx")?c.resolve(d.get("idx")):a.get("index.json").success(function(a){c.resolve(a),d.set("idx",a)}),c.promise},h=function(c){var f=b.defer();return d.get(c)?f.resolve(d.get(c)):a({method:"JSONP",url:e,params:{q:'collection:"'+c+'"',"fl[]":["avg_rating","date","downloads","description","identifier","year","title"],"sort[]":["date desc","",""],rows:"10000",page:"1",indent:"yes",output:"json",callback:"JSON_CALLBACK",save:"yes"}}).success(function(a){f.resolve(a),d.set(c,a)}).error(function(a){f.reject(a)}),f.promise},i=function(c){var e=b.defer();return d.get(c)?e.resolve(d.get(c)):a({method:"JSONP",url:f+c,params:{output:"json",callback:"JSON_CALLBACK"}}).success(function(a){e.resolve(a),d.set(c,a)}),e.promise};return{getIndex:function(){return g()},getList:function(a){return h(a)},getShow:function(a){return i(a)}}}]),angular.module("archiveApp").controller("ListController",["$scope","Archive","$stateParams","_",function(a,b,c,d){var e;b.getList(c.collection).then(function(b){e=b.response.docs;var c=d.uniq(d.pluck(e,"year"));a.shows=e,a.years=c,a.years.push("All"),a.limit=20}),a.loadMore=function(){a.limit+=20},a.yearOf=c.year,a.setYear=function(b){a.limit=20,a.yearOf="All"===b?void 0:b}}]),angular.module("archiveApp").controller("DetailController",["$scope","Archive","$stateParams","Playlist",function(a,b,c,d){b.getShow(c.id).then(function(b){a.data=b,a.metadata=b.metadata,a.item=b.item,a.reviews=b.reviews,a.misc=b.misc,a.metakeys=Object.keys(a.metadata);for(var d in b.files)b.files[d].path=d,b.files[d].server=b.server,b.files[d].dir=b.dir,b.files[d].band=b.metadata.creator[0],b.files[d].date=b.metadata.date[0],b.files[d].orig=c.id,b.files[d].collection=b.metadata.collection[0],b.files[d].url="http://"+b.server+b.dir+d;var e=_.filter(b.files,function(a){return!a.hasOwnProperty("length")}),f=_.filter(b.files,function(a){return"VBR MP3"===a.format});a.notTracks=e,a.tracks=f}),a.addTrack=function(a){d.addTrack(a)},a.addShow=function(a){d.addShow(a)}}]),angular.module("archiveApp").directive("auiPlayer",function(){return{templateUrl:"views/player.html",restrict:"EA",scope:!0,controller:"PlayerController",replace:!1,link:function(){}}}).factory("audio",["$document",function(a){var b=a[0].createElement("audio");return b}]),angular.module("archiveApp").controller("PlayerController",["Playlist","$scope","audio","localStorageService","$rootScope",function(a,b,c,d,e){var f=a.playlist,g=d,h=!1;console.log(a);var i=g.get("playlist.current")||{album:0,track:0};b.playing=!1,b.path="",b.play=function(a,d){f.length&&(angular.isDefined(a)&&(i.track=a),angular.isDefined(d)&&(i.album=d),h||(c.src=f[i.album].tracks[i.track].url),c.play(),b.playing=!0,h=!1,g.set("playlist.current",i),b.currentlyPlaying=f[i.album].tracks[i.track].title)},b.pause=function(){b.playing&&(c.pause(),b.playing=!1,h=!0)},b.prev=function(){f.length&&(h=!1,i.track>0?i.track--:(i.album=(i.album-1+f.length)%f.length,i.track=f[i.album].tracks.length-1),b.playing&&b.play())},b.next=function(){f.length&&(h=!1,f[i.album].tracks.length>i.track+1?i.track++:(i.track=0,i.album=(i.album+1)%f.length),b.playing&&b.play())},b.current=i,c.addEventListener("ended",function(){e.$apply(b.next)},!1)}]),angular.module("archiveApp").factory("Playlist",["localStorageService",function(a){var b,c,d,e=a,f=e.get("playlist")||[],g=function(){f=[],e.set("playlist",f)},c=function(a){f.length&&f.slice(-1)[0].album===a.album?f.slice(-1)[0].tracks.push(a):f.push({album:a.album,detail:a.orig,tracks:[a],collection:a.collection,date:a.date}),e.set("playlist",f)},d=function(a){f.length&&f.slice(-1)[0].album===a[0].album?f.slice(-1)[0].tracks=a:f.push({album:a[0].album,detail:a[0].orig,tracks:a,collection:a[0].collection,date:a[0].date}),e.set("playlist",f)};return{removeTrack:function(a){return b(a)},addTrack:function(a){return c(a)},addShow:function(a){return d(a)},clearPlaylist:function(){return g()},playlist:f}}]);