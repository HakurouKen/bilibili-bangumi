var bangumi_module = angular.module('bangumi_subscribe',[]);

bangumi_module.controller('bangumi_sub',function($scope){
	var bg = chrome.extension.getBackgroundPage();
	$scope.bangumi= bg.bangumi; 

	// true: subscribe version
	// false: show version
	$scope.status = false;

	$scope.toogleStatus = function(){
		$scope.status = !$scope.status;
	}
	
	$scope.toogle = function(dom){
		//console.log(dom);
		if($scope.status === true){
			dom.info.sub = !dom.info.sub;
			bg.Tools.save_data($scope.bangumi);
		}else{
			chrome.tabs.create({
				url:"http://www.bilibili.tv/sp/" + dom.info.title
			});
		}
	}

	var toogle_btn = document.getElementsByClassName("toogle")[0];
	$scope.$watch('status', function(){
		if($scope.status == true){
			toogle_btn.textContent = "查看";
		}else{
			toogle_btn.textContent = "订阅";
		}
	});
});
