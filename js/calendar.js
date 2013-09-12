Bk.Calendar = (function() {

    var self = {};
    
    //Constants
    //------------------------------------------------------------------
    
    var CS = {
        "CLOSE_CLASS"          : "bkCalClose"             ,    // CSS classes
        "NEXT_MONTH_CLASS"     : "bkCalMonthNavNext"      ,     
        "PREVIOUS_MONTH_CLASS" : "bkCalMonthNavPrev"      ,     
        
        "DAY_DATA"             : "data-bk-calendar-day"   ,    // Data attributes
        "MONTH_DATA"           : "data-bk-calendar-month" ,    
        "YEAR_DATA"            : "data-bk-calendar-year"  ,    
        "CONF_DATA" 		   : "data-bk-configuration",
        
        "DEFAULT_FORMAT"       : "%m%j%a"                 ,
        "CALENDAR_HEIGHT"      : 75    // unit in percentage
    };
    
    
    
    //Private 
    //------------------------------------------------------------------
    var _input         = null;
    var _calendar      = null;
    var _year          = null;
    var _month         = null;
    var _configuration = null;
    var _onOrientationChangeEventName = "resize";    //default value. #defensive
    
    var _isWebKitAndroid = function() {
        return navigator.userAgent.toLowerCase().search("android") != -1
            && navigator.userAgent.toLowerCase().search("webkit")  != -1;
    };
    
    
    /**
     * Returns the number of months since 1st January.
     */
    function _nbJ(dateX) {
        var j_mois = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];
        mm = dateX.getMonth();
        aa = dateX.getFullYear();
        nb = j_mois[mm] + dateX.getDate() - 1;
        if ((aa % 4 == 0 && aa % 100 != 0 || aa % 400 == 0) && mm > 1) {
            nb++;
        }
        return nb;
    };
    
    /**
     * Generates the calendar.
     */
    var _generate = function() {
    
        if (_month < 0) {
            _month += 12;
            _year--;
        } else if (_month > 11) {
            _month -= 12;
            _year++;
        }
        
        var value = _input.value;
        var selectedDate = _getCalendarDate(value, _configuration["format"]);

        htm = "<span class='bkCalWrapper'>";
        htm += "<div class='bkCalHead'>";
        htm += "<ul class='bkCalTitle'>";
        htm += "<li class='bkCalTitle'>" + _configuration["titre"] + "</li>";
        htm += "<li class='" + CS.CLOSE_CLASS + "'><span class=\"bk\">x</span></li>";
        htm += "</ul>";
        htm += "<ul class='bkCalMonth'>";
        htm += "<li class='" + CS.PREVIOUS_MONTH_CLASS + "'><span class=\"bk\">&lt;</span></li>";
        htm += "<li class='bkCalMonth'>" + _configuration["mois"][_month] + " " + _year + "</li>";
        htm += "<li class='" + CS.NEXT_MONTH_CLASS + "'><span class=\"bk\">&gt;</span></li>";
        htm += "</ul></div>";
        htm += "<table class='bkCal'>";
        htm += "<thead>";
        htm += "<tr class='bkCalWeekDays'>";
        pJs = _configuration["debutSemaine"];
        pJm = new Date(_year, _month, 1, 12, 0, 0).getDay();
        pjT = 1 - pJm + pJs;
        pjT -= (pjT > 1) ? 7 : 0;
        dateX = new Date(_year, _month, pjT, 12, 0, 0);
        for (j = 0; j < 7; j++) {
            htm += "<th>" + _configuration["jour"][(j + pJs) % 7] + "</th>";
        }
        htm += "</tr>";
        htm += "</thead><tbody>";
    
        var avantFinMois = true;
        var idx = 0;
        var idxM = parseInt(_nbJ(new Date(_year, _month, 1, 12, 0, 0)) / 7 + 1, 10);
        
        while (avantFinMois) {
            var obj = _dateAndClass(idx, dateX, _month, selectedDate);
            htm += (idx % 7 == 0) ? "<tr>" : "";
            htm += '<td'
                    + ' class="' + obj.classes + '"'
                    + ' ' + CS.YEAR_DATA + '="' + dateX.getFullYear() + '"'
                    + ' ' + CS.MONTH_DATA + '="' + dateX.getMonth() + '"'
                    + ' ' + CS.DAY_DATA + '="' + dateX.getDate() + '"'
                    + '>' + obj.date + '</td>';
            idx++;
            if (idx % 7 == 0) {
                htm += "</tr>";
                idxM++;
            }
            dateX = new Date(dateX.getFullYear(), dateX.getMonth(), dateX.getDate() + 1, 12, 0, 0);
            if (idx > 7 && idx % 7 == 0 && dateX.getMonth() != _month) {
                avantFinMois = false;
            }
        }
    
        htm += "</tbody></table></span>";
        _calendar.innerHTML = htm;
        
        _calendar.onclick = function() {};    // 'onclick' event is not fired on iOS 3, need to enforce it
                                              //  http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
    };
    
    var _addZero = function(val) {
        return ((val < 10) ? "0" : "") + val;
    };
    
    var _dateAndClass = function(idx, dateX, mm, selectedDate) {
        var dnow = new Date();
        pJs = _configuration["debutSemaine"];
        var result = {};
        result.classes = "";
        if (_configuration["jPause"][(idx + pJs) % 7] == true) {
            result.classes += " bkCalWeekend";
        }
        if (dateX.getMonth() != mm) {
            result.classes += " bkCalOtherMonth";
        }
        if (dateX.getMonth() == dnow.getMonth() && dateX.getFullYear() == dnow.getFullYear()
                && dateX.getDate() == dnow.getDate()) {
            result.classes += " bkCalToday";
        } else if (dateX.getMonth() == selectedDate.getMonth() && dateX.getFullYear() == selectedDate.getFullYear()
                && dateX.getDate() == selectedDate.getDate()) {
            result.classes += " bkCalSelectedDay";
        } else {
            result.classes += " bkCalCurrentMonth";
        }
    
        result.date = dateX.getDate();
        return result;
    }
    
    var _getCalendarId = function(){
        if(!_input){
            console.error("input type date not found.");
            return null;
        }
        return "bk-calendar-" + _input.id;
    };
    
    /**
     * Display the calendar.
     */
    function _open() {
        
    	Bk.Event.fireEvent(Bk.Event.BK_CALENDAR_BEFORE_OPEN);
    	
        var id = _getCalendarId();
    
        if (document.getElementById(id) == null) {
            _calendar = document.createElement('div');
            _calendar.setAttribute('id', id);
            _calendar.style.position = "absolute";
            _calendar.style.height = CS.CALENDAR_HEIGHT + "%";
            _calendar.style.top = "0px";
            _calendar.style.left = "0px";
            _calendar.style.zIndex = "4";
            _calendar.className = 'bkCal';

            document.body.appendChild(_calendar);

            if(window.ActiveXObject) {    //@9c1e9
                //remove old document click listener
                Bk.Event.removeListener("click", document, Bk.Event.Delegator.clickListener);
                Bk.Event.addListener("click", document, _enableClickOnChildsOrDie);
            }
            
            _setCalendarTopPosition(_calendar);
            
            var date = _getCalendarDate(_input.value, _configuration["format"]);
            
            _month = date.getMonth();
            
            _year = date.getFullYear();
            
            _generate(_input.id, _calendar.id);
            
    
        } else {
            _calendar.style.setProperty('display', 'block', '');
        }

        Bk.Overlay.showOverlay();
    }
    
    var _destroy = function() {
        
        //Clean up our listeners.
        Bk.Event.removeListener(_onOrientationChangeEventName, window, _onOrientationChangeHandler);
        
        if(window.ActiveXObject) {    //@9c1e9
            Bk.Event.addListener("click", document, Bk.Event.Delegator.clickListener);
            Bk.Event.removeListener("click", document, _enableClickOnChildsOrDie);
        }
        
        _calendar.parentNode.removeChild(_calendar);
        _calendar = null;
        _input = null;
        Bk.Overlay.hideOverlay();
        _enableFieldsFocus();
    };
    
    var _setCalendarTopPosition = function(cal) {
        var calendarHeight = 0;
        if (window.getComputedStyle) {
            calendarHeight = parseInt(window.getComputedStyle(cal, null).getPropertyValue("height"));
        } else if (cal.currentStyle) {
            calendarHeight = (Bk.Util.getClientHeight() * CS.CALENDAR_HEIGHT) / 100;
        }
    
        var topPos = ((Bk.Util.getClientHeight() - calendarHeight) / 2);
        var top = topPos + Bk.Util.getScrollOffset();
        cal.style.top = top + 'px';
    };
    
    var _getCalendarDate = function(val, dateFormat) {
        if (!_isDateValid(val, dateFormat)) {
            return new Date();
        } else {
            var date = _getDate(val, dateFormat);
            return new Date(date["year"], date["month"] - 1, date["day"]);
        }
    }
    
    var _isDateValid = function(strDate, dateFormat) {
        var VALID_DATE_LENGHT = 8;
        var daysInMonth = _getDaysArray(12);
        if (isNaN(strDate) || (strDate.length < VALID_DATE_LENGHT)) {
            return false;
        }
        var date = _getDate(strDate, dateFormat);
        if (date["month"] < 1 || date["month"] > 12) {
            return false;
        }
        if (date["day"] < 1 || date["day"] > 31 || (date["month"] == 2 && date["day"] > _getDaysInFebruary(date["year"]))
                || date["day"] > daysInMonth[date["month"]]) {
            return false
        }
        if (date["year"] == 0) {
            return false
        }
        return true;
    }
    
    var _getDate = function(strDate, dateFormat) {
        var day = 0, month = 0, year = 0;
    
        if (dateFormat == CS.DEFAULT_FORMAT) {
            day = parseInt(strDate.substring(2, 4), 10);
            month = parseInt(strDate.substring(0, 2), 10);
            year = parseInt(strDate.substring(4, 8), 10);
        } else {
            day = parseInt(strDate.substring(0, 2), 10);
            month = parseInt(strDate.substring(2, 4), 10);
            year = parseInt(strDate.substring(4, 8), 10);
        }
    
        var theDate = new Array();
        theDate["day"] = day;
        theDate["month"] = month;
        theDate["year"] = year;
    
        return theDate;
    }
    
    var _getDaysInFebruary = function(year) {
        // February has 29 days in any year evenly divisible by four,
        // EXCEPT for centurial years which are not also divisible by 400.
        return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
    }
    
    var _getDaysArray = function(n) {
        for ( var i = 1; i <= n; i++) {
            this[i] = 31;
            if (i == 4 || i == 6 || i == 9 || i == 11) {
                this[i] = 30;
            }
            if (i == 2) {
                this[i] = 29;
            }
        }
        return this;
    };
    
    /**
     * Function to be called After the configuration attribute has been parsed.
     * When you implement this function to modify the configuration, you should 
     * return the configuration object.
     * 
     * @param Actual configuration. 
     * @return configuration object to be used.
     */
    self.postConfiguration = function(config){
    	return config;
    };
    
    /**
     * Function called before a date is picked.
     * Can be overridden for customization purposes.
     * @param date date picked.
     * @param input the element that triggered the calendar
     * @param configuration JSON object containing calendar configuration.
     * @return boolean true to pick the date, false to avoid picking the date.
     */
    self.beforeDatePicked = function(date, input, configuration) {
    	return true;
    };
    
    /**
     * Function called after a date is picked (and the input is updated)
     * Can be overridden for customization purposes.
     * @param dateAffiche date displayed as input value.
     * @param input input element updated
     * @param configuration JSON object containing calendar configuration.
     * @return void
     */
    self.afterDatePicked = function(dateAffiche, input, configuration) {
    	return;
    };
    
    /**
     * Pick a date.
     */
    var _pick = function(aa, mm, jj) {
		if (!_input) {
            return;
        }
        var datePos = new Date(aa, mm, jj);
        if (self.beforeDatePicked(datePos, _input, _configuration) !== false) {
	        var jour = datePos.getDay();
	        var dateAffiche = _configuration["format"].replace("%j", _addZero(datePos.getDate())).replace("%k", datePos.getDate())
	                .replace("%d", _configuration["jLib"][jour]);
	        dateAffiche = dateAffiche.replace("%m", _addZero(datePos.getMonth() + 1)).replace("%n", datePos.getMonth() + 1)
	                .replace("%p", _configuration["mois"][datePos.getMonth()]);
	        dateAffiche = dateAffiche.replace("%a", datePos.getFullYear()).replace("%y", datePos.getYear());
	       _input.value = dateAffiche;
	        self.afterDatePicked(dateAffiche, _input, _configuration);
	       _destroy();
       }
    };
    
    var _isCalendarOpened = function() {
        return _calendar !== null;
    };

    var _enableFieldsFocus = function() {
        if (_isWebKitAndroid()) {
            var fields = document.getElementsByTagName("input");
            var l = fields.length;
            for (var i = 0; i < l; i++) {
                fields[i].disabled = false;
            }
        }
    };
    
    var _enableClickOnChildsOrDie = function(e){    //@9c1e9
        e = e || window.event;
        var t = e.target || e.srcElement;

        if(Bk.Dom.findParentNodeByAttr('id', _getCalendarId(), t)){    // parentNode trouvé ! C'est notre calendar
            Bk.Event.Delegator.clickListener(e);                       // alors autoriser le click.

        }else{
            _destroy();
            Bk.Event.preventDefault(e);
        }
    };
    
    
    var _handleClickEvent = function(target) {
        
        // Display the calendar
        if (Bk.Dom.hasClass(target, "bkCalBtn")) {
            
            _input = (target.nodeName.toLowerCase() === "span") ? target.parentNode.firstChild : target;
            
            var config = JSON.parse(_input.getAttribute(CS.CONF_DATA));
            
            _configuration = {
                titre       : _input.getAttribute("data-bk-title") || '',
                mois        : config.mois.split(","),
                jLib        : config.jLib.split(","),
                jour        : config.jour.split(","),
                debutSemaine: config.debutSemaine,
                format      : config.format,
                jPause      : {
                    6 : true,
                    0 : true
                },
                moisMoins: "&#160;",
                moisPlus : "&#160;"
            };
            
            var _cnf = self.postConfiguration(_configuration);
            if(_cnf){
            	_configuration = _cnf;
            }
            
            _open();
        }
        
        // Select a date
        if (target.getAttribute(CS.DAY_DATA) !== null) {
            var year  = target.getAttribute(CS.YEAR_DATA);
            var month = target.getAttribute(CS.MONTH_DATA);
            var day   = target.getAttribute(CS.DAY_DATA);
            
            _pick(year, month, day);
            return;
        }
        
        // Previous month
        if (Bk.Dom.hasClass(target, CS.PREVIOUS_MONTH_CLASS) 
               || Bk.Dom.hasClass(target.parentNode, CS.PREVIOUS_MONTH_CLASS)) {
            _month--;
            _generate();
            return;
        }
        
        // Next month
        if (Bk.Dom.hasClass(target, CS.NEXT_MONTH_CLASS) 
               || Bk.Dom.hasClass(target.parentNode, CS.NEXT_MONTH_CLASS)) {
            _month++;
            _generate();
            return;
        }
        
        // Close the calendar
        if (Bk.Dom.hasClass(target, CS.CLOSE_CLASS) 
                || Bk.Dom.hasClass(target.parentNode, CS.CLOSE_CLASS)) {
        	Bk.Event.fireEvent(Bk.Event.BK_CALENDAR_ON_CLOSE);
            _destroy();
            return;
        }
        
    };
    
    var _onOrientationChangeHandler = function() {
        if (_isCalendarOpened()) {
            Bk.Overlay.setOverlaySize();
        }
    };
    
    self.getConstants = function() {
    	return CS;
    };
    
    // *********************
    // WIDGET INITIALIZATION
    
    (function() {
        Bk(document).one(Bk.Event.BK_PAGE_LOADED, function() {
            Bk.Event.Delegator.registerEventHandler(_handleClickEvent);
        });
        Bk.onPageUnloaded(function() {
            if (_isCalendarOpened()) {
                _destroy();
            }
        });
        
        _onOrientationChangeEventName = Bk.Event.onOrientationChange(_onOrientationChangeHandler);
        
    }());
    
    return self;

})();
