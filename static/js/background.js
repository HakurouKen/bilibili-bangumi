var bangumi = {}
// data format : 
//	bangumi (object)
//		> count (number) : total count of bangumis
//		> sub (number) : total count of subscribed bangumis
//		> new (number) : totol count of new bangumis
//		> weekday (array): bangumis ranged by weekday
//			- content (object) :
//				> name (string) : name of the day (e.g. Sat.)
//				> new (number) : total count of new bangumis of this day
//				> sub (number) : total count of subscribed bangumis of this day
//				> list (array) : the bangumi data
//					- content (object)

var type = function(o){
	return Object.prototype.toString.call(o).slice(8,-1);
}
Array.prototype.sum = function(){
	var total=0;
	for( var i=0,l=this.length; i<l ;i++ ){
		total += this[i];
	}	
	if(type(total) === "String"){
		return total.slice(1);
	}
	return total;
};

var Tools = (function(window,$,undefined){
	function get_bangumi_list(bangumi_data){
		// bangumi_data : pickled data	
		if(bangumi_data == undefined || bangumi_data.weekday == undefined){
			return[];
		}
	
		var weekday = bangumi_data.weekday;
		var all = [];
		try{
			for (var i = 0 , len = weekday.length ; i < len ; i++){
				all = all.concat(weekday[i].list);
			}
		return all;
		}catch(err){
			return [];
		}
		return [];
	}
	
	function get_bangumi(bangumi_arr,opt){
		// bangumi_arr : a bangumi list 
		// opt : object
		var needed = [];
		opt = opt || {};

		try{
			for(var i = 0, len = bangumi_arr.length ; i < len ; i++ ){
				var f = true;
				for(var key in opt){
					if(opt[key] !== bangumi_arr[i][key]){
						f = false;
						break;
					}
				}
				if(f){
					needed.push(bangumi_arr[i]);
				}
			}
			//console.log(needed);
			return needed;
		}catch(err){
			return [];
		}
		 return [];
	}
	
	function get_statistics(arr,opt){
		var count = 0;
		arr.forEach(function(b){
			for(var key in opt){
				if(opt[key] === b[key]){
					count ++;
				}	
			}
		});
		return count;
	}

	function save_data(data){
		// data : pickled bangumi data without the static data refresh
		for(var i = 0 , l = data.weekday.length ; i<l ; i++){
			data.weekday[i]["new"] = get_statistics(data.weekday[i].list,{"new":true});
			data.weekday[i]["sub"] = get_statistics(data.weekday[i].list,{"sub":true});
		}

		data["new"] = get_statistics(get_bangumi_list(data),{"new":true});
		data["sub"] = get_statistics(get_bangumi_list(data),{"sub":true});

		window.bangumi = data;
		window.localStorage.setItem("bangumi_data",JSON.stringify(window.bangumi));
	}
	
	function get_saved_data(){
		return JSON.parse(window.localStorage.getItem("bangumi_data"));
	}
	
	function format_data(raw_data){
		// raw_data : the data get from api.bilibili.tv directly
		var bangumi = {},
			weekday = [],
			raw_list = raw_data.list,
			week = ["Sun.","Mon.","Tues.","Wed.","Thur.","Fri.","Sat."];
	
		var old_data = get_saved_data();
			
		for(var b in raw_list){
			var	cur_weekday = parseInt(raw_list[b].weekday), 
				old_item = get_bangumi(get_bangumi_list(old_data),{"spid":raw_list[b].spid})[0];
				//console.log(old_item);
				raw_list[b].sub = (old_item == undefined || old_item.length === 0 )? false : !!old_item.sub;
	
			if(typeof weekday[cur_weekday] == 'undefined'){
				weekday[cur_weekday] = {};
				weekday[cur_weekday]["name"] = week[cur_weekday];
				weekday[cur_weekday]["new"] = 0;
				weekday[cur_weekday]["sub"] = 0;
				weekday[cur_weekday]["list"] = [];
			}
			if(raw_list[b]["sub"]){
				weekday[cur_weekday]["sub"]++;
			}
			if(raw_list[b]["new"]){
				weekday[cur_weekday]["new"]++;
			}

			weekday[cur_weekday]["list"].push(raw_list[b]);
		}
		
		// put today's day first
		var day_sort = function(weekday_arr){
			var today = new Date().getDay();
			var sorted_day = [];
			for(var i = 0 , len = weekday_arr.length ; i < len ; i++){
				sorted_day[i] = weekday_arr [ i+today<7 ? i+today : i+today-7 ];
			}
			return sorted_day;
		}
	
		weekday = day_sort(weekday);
	
		bangumi.weekday = weekday;
		bangumi.count = raw_data.count;
		bangumi["sub"] = weekday.map(function(day){return day["sub"]}).sum();
		bangumi["new"] = weekday.map(function(day){return day["new"]}).sum();
		
		//console.log(bangumi);
		return bangumi;
	}
	
	function refresh_data(){
		$.ajax({method:'GET',url:'http://api.bilibili.tv/bangumi?appkey=12737ff7776f1ade'}).
			success(function(new_data){
				//console.log(new_data);
				window.bangumi = format_data(new_data);
				var n = get_bangumi(get_bangumi_list(window.bangumi),{"sub":true,"new":true}).length;
				if(!!n){
					chrome.browserAction.setBadgeText({ text: n.toString()});
					chrome.browserAction.setBadgeBackgroundColor({color: "#0666C5"});
				}
			}).
			error(function(){
				return;	
			});
	}

	var sec = 300;
	function interval(){
		refresh_data();
		setTimeout(interval,sec*1000);
	}
	interval();

	refresh_data();

	return{
		get_bangumi_list : get_bangumi_list,
		save_data : save_data,
		get_bangumi : get_bangumi,
		
		get_refresh_time : function(){ return sec; },
		set_refresh_time : function(time){ sec = time; }
	}

})(window,jQuery)
