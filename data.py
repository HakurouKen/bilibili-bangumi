#coding:utf-8
import Timer
import urllib2
import json

import sys
reload(sys)
sys.setdefaultencoding("utf-8")

def get_raw_data():
	url = "http://api.bilibili.tv/bangumi?appkey=12737ff7776f1ade"
	request = urllib2.Request(
		url = url
	)
	data = urllib2.urlopen(request).read()
#	print data
	return json.loads(data)

def format_data(raw_data):
	bangumi = {}
	bangumi["count"] = raw_data["count"]
	weekday = {}
	bangumi["weekday"] = weekday 
	raw_list = raw_data["list"]

	for i in range(0,7):
		weekday[str(i)] = []
	
	for b in raw_list:
		cur_weekday = raw_list[str(b)]["weekday"]
		weekday[str(cur_weekday)].append(raw_list[b])
		
	return bangumi

def renew_data(time_step): 
	t = Timer.Timer(format_data,[get_raw_data()],time_step,False)
	t.start()
	return t

def stop(timer):
	timer.stop()
	return timer