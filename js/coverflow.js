
/**
 * 3D coverflow.
 * 
 * @namescape
 */
Bk.Coverflow = (function () {

    var global = this;
    
    function utils_extend(obj, dict) {
        for (var key in dict) {
            obj[key] = dict[key];
        }
    }
    
    function utils_setsize(elem, w, h) {
        elem.style.width = w.toString() + "px";
        elem.style.height = h.toString() + "px";
    }
    
    function utils_setxy(elem, x, y) {
        elem.style.left = Math.round(x).toString() + "px";
        elem.style.top = Math.round(y).toString() + "px";
    }
    
    /*
        TrayController is a horizontal touch event controller that tracks cumulative offsets and passes events to a delegate. 
    */
    
    TrayController = function () {
        return this;
    }
    
    TrayController.prototype.init = function (elem) {
        this.currentX = 0;
        this.elem = elem;
    }
    
    TrayController.prototype.touchstart = function (event) {
        this.startX = event.touches[0].pageX - this.currentX;
        this.touchMoved = false;
    
        window.addEventListener("touchmove", this, true);
        window.addEventListener("touchend", this, true);
    
        this.elem.style.webkitTransitionDuration = "0s";
    }
    
    TrayController.prototype.touchmove = function (e) {
        this.touchMoved = true;
        this.lastX = this.currentX;
        this.lastMoveTime = new Date();
        this.currentX = event.touches[0].pageX - this.startX;
        this.delegate.update(this.currentX);
    }
    
    TrayController.prototype.touchend = function (e) {
        window.removeEventListener("touchmove", this, true);
        window.removeEventListener("touchend", this, true);
    
        this.elem.style.webkitTransitionDuration = "0.4s";
    
        if (this.touchMoved) {
            /* Approximate some inertia -- the transition function takes care of the decay over 0.4s for us, but we need to amplify the last movement */
            var delta = this.currentX - this.lastX;
            var dt = (new Date()) - this.lastMoveTime + 1;
    
            this.currentX = this.currentX + delta * 50 / dt;
            this.delegate.updateTouchEnd(this);
        } else {
            //this.delegate.clicked(this.currentX);
            Bk.Event.createAndDispatchEvent("click", e.target);
        }
    };
    
    TrayController.prototype.handleEvent = function (event) {
        if(this[event.type]){
            this[event.type](event);
            event.preventDefault();
        }
    };
    
    var root;
        
    FlowDelegate = function (cSize) {
        this.cells = new Array();
        this.bullets = new Array();
        this.transforms = new Array();
        this.cSize = cSize; 
        this.cGap = this.cSize / 1.85;
//        this.flowAngle = 72;
        this.flowAngle = 65;
        this.flowThreshold = this.cGap / 2;
        this.flowZFocus = 0;
        this.flowXGap = this.cSize / 4;
        this.tNegAngle = "rotate3d(0, 1, 0, " + (- this.flowAngle) + "deg)";
        this.tAngle = "rotate3d(0, 1, 0, " + this.flowAngle + "deg)";
        this.tZFocus = "translate3d(0, 0, " + this.flowZFocus + "px)";
    }
    
    FlowDelegate.prototype.init = function (elem) {
        this.elem = elem;
    }
    
    FlowDelegate.prototype.updateTouchEnd = function (controller) {
        this.lastFocus = undefined;
    
        // Snap to nearest position
        var i = this.getFocusedCell(controller.currentX);
    
        controller.currentX = - i * this.cGap;
        this.update(controller.currentX);
    }
    
    FlowDelegate.prototype.clicked = function (currentX) {
        
        var i = - Math.round(currentX / this.cGap);
        var cell = this.cells[i];
        
        var anchor = cell.querySelector("a");
        
        if (anchor) {
            Bk.Event.Delegator.handleLinkClickEvent(anchor);
        }
    }
    
    FlowDelegate.prototype.getFocusedCell = function (currentX) {
        // Snap to nearest position
        var i = - Math.round(currentX / this.cGap);
    
        // Clamp to cells array boundary
        return Math.min(Math.max(i, 0), this.cells.length - 1);
    }
    
    FlowDelegate.prototype.transformForCell = function (cell, i, offset) {
        var x = (i * this.cGap);
        var ix = x + offset;

        if ((ix < this.flowThreshold) && (ix >= -this.flowThreshold)) {
//            console.log("ix:" + ix + ",i:" + i, ",flowThreshold:" + this.flowThreshold);
            if(ix == 0) {
//                console.error("UPDATING BULLETS");
                this.updateBullet(i);
                this.updateCell(i);
            }

            if(x === 0) {
                // unsure why we want to concatenate both translate3d
                return this.tZFocus;
            }
            return this.tZFocus + " translate3d(" + x + "px, 0, 0)";
        } else if (ix > 0) {
//            console.warn("ix>0 !");
            return "translate3d(" + (x + this.flowXGap) + "px, 0, 0) " + this.tNegAngle;
        } else {
//            console.warn("ix<0 !");
            return "translate3d(" + (x - this.flowXGap) + "px, 0, 0) " + this.tAngle;
        }
    }
    
    FlowDelegate.prototype.updateBullet = function(current) {
        for (var i in this.bullets) {
            if (i == current) {
                Bk.Dom.addClass(this.bullets[i], 'bk-active');
            } else {
                Bk.Dom.removeClass(this.bullets[i], 'bk-active');
            }
        }
    };
    
    FlowDelegate.prototype.updateCell = function(current) {
        
        var current = parseInt(current);
        
        if (this.cells.length == 0) {
            return;
        }
        
        this.cells[current].style.zIndex = 0;

        var j = 1;
        for  (var i = (current - 1) ; i >= 0 ; i --) {
            this.cells[i].style.zIndex = -j;
            j++;
        }

        var j = 1;
        for  (var i = (current + 1) ; i < this.cells.length ; i ++) {
            this.cells[i].style.zIndex = -j;
            j++;
        }
        
    };
    
    FlowDelegate.prototype.setTransformForCell = function (cell, i, transform) {
        if (this.transforms[i] != transform) {
            if (!cell.style) cell.style = "";
            cell.style.webkitTransform = transform;
            this.transforms[i] = transform;
        }
    }
    
    FlowDelegate.prototype.update = function (currentX) {
        this.elem.style.webkitTransform = "translate3d(" + (currentX) + "px, 0, 0)";
        
        /*
            It would be nice if we only updated dirty cells... for now, we use a cache
        */
        for (var i in this.cells) {
            var cell = this.cells[i];
            this.setTransformForCell(cell, i, this.transformForCell(cell, i, currentX));
        }
        
    }
    
    /**
     * @scope Bk.Coverflow
     */
    return {

        /**
         * 
         */
        load: function (id) {
            
            root = Bk.Dom.getElementById(id);
            var width = root.getAttribute("data-bk-items-width");
            
            var tray = root.querySelector("div[class='tray']");

            var centering = root.querySelector("div[class='centering']");
            centering.style.height = root.querySelector("img").clientHeight + "px";
            
            var centerCoverflow = function(_container, _root, _cSize) {
//                console.info("(_root.clientWidth=" + _root.clientWidth + "  _cSize=" + _cSize);
                _container.style.left = (_root.clientWidth / 2) - (_cSize/2) + "px";
            };
            
            centerCoverflow(tray, root, width);
            
            Bk.Event.onOrientationChange(function(tray, root, width) { 
                return function() {
                    centerCoverflow(tray, root, width);
                };
            }(tray, root, width));
            
            var controller = new TrayController();
            controller.init(tray);

            var delegate = new FlowDelegate(width);
            delegate.init(tray);
            
            controller.delegate = delegate;

            var bullets = null;

            for (var i = 0 ; i < tray.childNodes.length ; i++) {
                
                var cell = tray.childNodes[i];
                var img = cell.querySelector("img");
                
                cell.style.width = delegate.cSize + "px";
                cell.style.height = img.clientHeight;
                
                var content = cell.querySelector("div[class='content']");
                content.style.width = delegate.cSize + "px";
                content.style.height = content.getElementsByTagName("img")[0].clientHeight;
                
                if (cell.nodeType == 1) {
                    delegate.setTransformForCell(cell, delegate.cells.length, 
                            delegate.transformForCell(cell, delegate.cells.length, controller.currentX));
                    delegate.cells.push(cell);
                }
                
                delegate.updateCell(0);
                
            }

            var bulletsContainer = Bk.Dom.getElementsByAttribute(root, "span", "class", "bk-bullets")[0];
            
            var nbOfBullets = tray.childNodes.length;
            
            for (var i = 0 ; i < nbOfBullets ; i ++) {
                var bullet = document.createElement("span");
                if (i == 0){
                    bullet.className = "bk-active";
                }
                bullet.innerHTML = "&#8226;";
                bulletsContainer.appendChild(bullet);
                delegate.bullets.push(bullet);
            }
            
            var length = delegate.bullets.length;
            var skew = 60;
            var minSkew = -skew / 2;
            var skewOffet = skew / (length -1);
            
            for (var i = 0; i < length; i++) {
                skew = minSkew + (i * skewOffet);
                delegate.bullets[i].style.webkitTransform = 'scale(1, 0.4) skew(' + skew + 'deg)';
            }
        
            tray.addEventListener('touchstart', controller, false);
        
            /* Limited keyboard support for now */
            window.addEventListener('keydown', function(e) {
                if (e.keyCode == 37) {
                    /* Left Arrow */
                    controller.currentX += delegate.cGap;
                    delegate.updateTouchEnd(controller);
                } else if (e.keyCode == 39) {
                    /* Right Arrow */
                    controller.currentX -= delegate.cGap;
                    delegate.updateTouchEnd(controller);
                }
            });
        }
        
    };
    
})();
