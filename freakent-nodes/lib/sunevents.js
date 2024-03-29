/**
 * Copyright 2013 Freak Enterprises
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *  This module provides a thin event emitting wrapper around the excellent SunCalc Module. 
 *
 *  Module Dependencies
 * 	- SunCalc (https://github.com/mourner/suncalc)
 *  - Moment (http://momentjs.com/)
 **/

var SunCalc = require('suncalc'),
    moment = require('moment'),
		util = require('util'),
		EventEmitter = require('events').EventEmitter;

function SunEvents(date, lat, lng, modes) {

	var self = this;
	
	this.suncalc = SunCalc;
	this.date = date;
	this.lat = lat;
	this.lng = lng;
	this.modes = modes || {};
	
	this.debug = modes.debug || false;
	this.test = modes.test || false;

	EventEmitter.call(this);
	
  this.init = function() {
		setTimers(date);
	}

	function setTimers(date) {
		var now = new Date();
		var endOfDay = moment(date).endOf('day');
		var startOfNextDay = moment(date).add('day', 1).startOf('day'); 
		debug("Setting Timers-> Now: %s, endOfDay: %s, startOfNextDay: %s", now, endOfDay, startOfNextDay);

		debug("Calculating times for %s", endOfDay);
		var times = SunCalc.getTimes(endOfDay, lat, lng);
		
		for (event in times) {
			eventMoment = moment(times[event]);
			millis = eventMoment.diff(now);
			hrs = eventMoment.diff(now, 'hours');
			if (eventMoment.isAfter(now)) {
				debug("Emit %s %s in %d hours", event, eventMoment.calendar(), hrs);
				setTimeout((function(event, date){
					return function() {
						//console.log("Firing %s in a closure", event);
						self.emit("sunevent", event, date);
						self.emit(event, date);
					}
				})(event, times[event]), (self.test ? millis/60 : millis));
			} else {
				debug("Ignore %s, was %s, %d hours ago", event, eventMoment.calendar(), hrs);
			}
		}
		
		debug("Scheduling next timers for %s\n", startOfNextDay);
		setTimeout(function(){setTimers(startOfNextDay.toDate())}, startOfNextDay.diff(now));
	}
	
	
	function debug() {
	  var args = Array.prototype.slice.call(arguments);
			if (self.modes.debug) {
			  str = "[sunevents] " + util.format.apply(this, arguments);
				self.emit("debug", str);
			}
	}
					
	
}


util.inherits(SunEvents, EventEmitter);
module.exports = SunEvents;

/** 



// format sunrise time from the Date object
var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();

// get position of the sun (azimuth and altitude) at today's sunrise
var sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1);

// get sunrise azimuth in degrees
var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;
*/