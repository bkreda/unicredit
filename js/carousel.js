/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 * Version commit 8cfe5acb88
 */

window.Swipe = function(element, options) {

  // return immediately if element doesn't exist
  if (!element) return null;

  var _this = this;

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};
  this.delay = this.options.auto  || 0;
  this.items = this.options.items || 1;
  this.loop  = this.options.loop  || false;
  
  // reference dom elements
  this.container = element;
  this.element = this.container.children[0]; // the slide pane

  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.margin = 0;

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.element.addEventListener) {
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
    this.element.addEventListener('touchcancel', this, false);
    this.element.addEventListener('webkitTransitionEnd', this, false);
    this.element.addEventListener('msTransitionEnd', this, false);
    this.element.addEventListener('oTransitionEnd', this, false);
    this.element.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);
  }

};

Swipe.prototype = {

  setup: function() {

    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;

    this.container.parentNode.style.opacity = 1;    //@L6e85
    
    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = Math.ceil((("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth) / this.items);

    // Fix width for Android WebView (i.e. PhoneGap) 
    if (this.width === 0 && typeof window.getComputedStyle === 'function') {
        this.width = window.getComputedStyle(this.container, null).width.replace('px','');
    }
    
    // return immediately if measurement fails
    if (!this.width) return null;

    // dynamic css
    this.element.style.width = Math.ceil(this.slides.length * this.width) + 'px';
    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.width + 'px';
      el.style.display = 'table-cell';
      el.style.verticalAlign = 'top';
    }

    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0); 

    //this.container.parentNode.style.opacity = 1;    //Too late. If carousel has 1 or 2 elements, this line won't be reached.    hash:L6e85

  },

  slide: function(index, duration) {

    var style = this.element.style;

    // fallback to default speed
    if (duration == undefined) {
        duration = this.speed;
    }

    // set duration speed (0 represents 1-to-1 scrolling)
    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';

    // translate to given index position
    //style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';
    var oldPropValue = style.webkitTransform;
    var newPropValue = 'translate(' + -(index * this.width) + 'px, 0px)' + ' translateZ(0px)';    //Enable hardware acceleration on iOS6
                                                                                             //https://github.com/bradbirdsall/Swipe/pull/117/files
    style.webkitTransform = newPropValue; 
    
    if(oldPropValue == newPropValue){   //Condition is true when autoplay=(small value, eg: 1000) and an orientation change happens.  
    	this.transitionEnd();           //When the old transition-property is equal to the new one, Webkit will not trigger a transitionEndEvent.
    }
    																						      
    style.MozTransform = style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';

    // set new index to allow for expression arguments
    this.index = index;

  },

  getPos: function() {
    
    // return current index position
    return this.index;

  },

  prev: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.length - this.items) this.slide(this.index+1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start

  },

  begin: function() {

    var _this = this;

    this.interval = (this.delay)
      ? setTimeout(function() { 
        _this.next(_this.delay);
      }, this.delay)
      : 0;

      if(!this.loop && this.index == this.length -2){
    	  this.delay = 0;
      }
  },
  
  stop: function() {
    this.delay = 0;
    clearTimeout(this.interval);
  },
  
  resume: function() {
    this.delay = this.options.auto || 0;
    this.begin();
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchcancel' :
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd':
      case 'msTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend': this.transitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
  },

  transitionEnd: function(e) {
    
    if (this.delay) this.begin();

    this.callback(e, this.index, this.slides[this.index]);

  },

  onTouchStart: function(e) {
    
    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;
    
    // reset deltaX
    this.deltaX = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;
    
    e.stopPropagation();
  },

  onTouchMove: function(e) {

    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    this.deltaX = e.touches[0].pageX - this.start.pageX;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY) );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {

      // prevent native scrolling 
      e.preventDefault();

      // cancel slideshow
      clearTimeout(this.interval);

      // increase resistance if first or last slide
      this.deltaX = 
        this.deltaX / 
          ( (!this.index && this.deltaX > 0               // if first slide and sliding left
            || this.index == this.length - this.items     // or if last slide and sliding right
            && this.deltaX < 0                            // and if sliding at all
          ) ?                      
          ( Math.abs(this.deltaX) / this.width + 1 )      // determine resistance level
          : 1 );                                          // no resistance if false
      
      // translate immediately 1-to-1
      this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';
      
      e.stopPropagation();
    }

  },

  onTouchEnd: function(e) {

    // determine if slide attempt triggers next/prev slide
    var isValidSlide = 
          Number(new Date()) - this.start.time < 250      // if slide duration is less than 250ms
          && Math.abs(this.deltaX) > 20                   // and if slide amt is greater than 20px
          || Math.abs(this.deltaX) > this.width/2,        // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
        isPastBounds = 
          !this.index && this.deltaX > 0                                   // if first slide and slide amt is greater than 0
          || this.index == this.length - this.items && this.deltaX < 0;    // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!this.isScrolling) {

      // call slide function with slide end value based on isValidSlide and isPastBounds tests
      //this.slide( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed );
      var deltaX = Math.round(this.deltaX / this.width);
            
      var index = this.index + ( isValidSlide && !isPastBounds ? -deltaX : 0 );
      
      if(index < 0){    //pastBounds on left side
          index = 0;
      }
      if(index > this.length - this.items){    //pastBounds on right side    
          index = this.length - this.items;
      }
      
      this.slide(index, this.speed );
    }
    
    e.stopPropagation();
  }

};


Bk.buildCarousel = function(args){

    // Sanity check 
	//-----------------------------------------------------------------------------
    
    var divCarousel = document.getElementById(args.carouselId);
    if(!divCarousel){    //Assert
        console.error("No element found with id " + args.carouselId  + ", aborting!");
        return ;
    }
    var ulWrapper = divCarousel.getElementsByTagName('div')[0];
    if(!ulWrapper){
        console.error("ul elements don't seem to be wrapped by a required wrapper, aborting!");
        return;
    }
    
    var prevBtn = Bk.Dom.getElementsByAttribute(divCarousel, "a", "data-bk-role", "prev")[0];
    if(!prevBtn){    //Assert
        console.error("'prev' button not found, aborting!");
        return ;
    }
    var prevBtnObj = new CarouselBtn({btn:prevBtn, onClick: onPrevBtnClick}) ;
    
    //Disable the the left btn
    disableCarouselBtn(prevBtnObj);

    var nextBtn = Bk.Dom.getElementsByAttribute(divCarousel, "a", "data-bk-role", "next")[0];
    if(!nextBtn){    //Assert
        console.error("'next' button not found, aborting!");
        return ;
    }
    var nextBtnObj = new CarouselBtn({btn:nextBtn, onClick: onNextBtnClick}) ;
    
    
    // Clean ARGs
    //----------------------------------------------------------------------------
    if(Bk.Util.isNumber(args.autoplay)){
    	args.autoplay = args.autoplay - 0;    //cast
    }else{
    	args.autoplay = 0;
    }
    
    if(args.loop === 'false'){
    	args.loop = false;
    }else{
    	args.loop = true;
    }
    
    if(Bk.Util.isNumber(args.startSlide)){
    	args.startSlide = args.startSlide - 0;    //cast
    	
    	if(args.startSlide < 0){
    		args.startSlide = 0;
    	}
    	
    	//Handle cases where startSlide is beyond the number of slides.
    	var _length = ulWrapper.children[0].children.length;
    	if(args.startSlide > _length - 1){
    		args.startSlide = (_length - 1) - (args.items - 1) ;
    	}
    	
    }else{
    	args.startSlide = 0;
    }
    

    // Build the bullet spans
    //-----------------------------------------------------------------------------
    
    /* setup bullets bar */
    var bulletsContainer = Bk.Dom.getElementsByAttribute(divCarousel, "span", "data-bk-role", "bullets")[0];
    if(!bulletsContainer){    //Assert
        console.error("bullets container not found");
        return ;
    }
    
    var ul = ulWrapper.getElementsByTagName('ul')[0];    //This one is can be a gotcha, because it looks up for 'ul' element only. 
    var nbOfBullets = ul.getElementsByTagName('li').length;
    nbOfBullets -= args.items-1;

    for(var i = 0 ; i < nbOfBullets ; i ++){
        var bullet = document.createElement("span");
        if(i == 0){
            bullet.className = "bk-active";
        }
        bullet.innerHTML = "&#8226;";
        bulletsContainer.appendChild(bullet);
    }
    
    /* * * * * * *       * * * * *  STEP 2 * * * * * * * *   * * * * * */
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /* * * * * * * * * * STEP 3 Initialize the Carousel  * * * * * * * */
    
    
    var swope = new Swipe(ulWrapper, {
        "items"		: args.items,
        "auto" 		: args.autoplay,
        "loop" 		: args.loop,
        "startSlide": args.startSlide,
        "callback"  : function(e, pos){
        	updateBulletsBar(pos, bulletsContainer);    //This function is called each time transition ends.
         }
    });
    
    if(args.startSlide !== 0){    
    	updateBulletsBar(swope.getPos(), bulletsContainer);
    }
    
    //Put the swope into the Bk namespace
    Bk.carousels = Bk.carousels || {};
    Bk.carousels[args.carouselId] = swope;
    
    Bk.Event.addListener("click", nextBtnObj.btn, nextBtnObj.onClick);    //On the next btn only. 
    																	  //No need to set listener for the previous, 
    																	  //as it is disabled the first time.
    // Private Methods
    //-------------------------------------------------------------------------------
    /**
     * @private
     */
    function onNextBtnClick(e){
        updateBulletsBar(swope.getPos() + 1, bulletsContainer);    //Internet explorer
                                                                   //Click event happens before the transition end,
                                                                   //and thus, swope.getPos() is still holding the  
                                                                   //older position of the bullet 
        swope.next();
        e.preventDefault();
    }
    
    /**
     * @private
     */
    function onPrevBtnClick(e){
        if(swope.getPos() > 0){    
            updateBulletsBar(swope.getPos() - 1, bulletsContainer);    //Internet explorer
                                                                       //Click event happens before the transition end,
                                                                       //and thus, swope.getPos() is still holding the  
                                                                       //older position of the bullet    
        }
        
        swope.prev();
        e.preventDefault();
    }
    
    /**
     * @private
     */
    function _preventDefault(e){
        e.preventDefault();
    }
    
    /**
     * @private
     * @param pos: position of the bullet where you want to put the bk-active class
     */
    function updateBulletsBar(pos, bulletsContainer){
        var bullets = bulletsContainer.getElementsByTagName('span');
        if(!bullets[pos]){    //Internet explorer
           pos = 0;
        }
        
        var i = bullets.length;
        while (i--) {
            bullets[i].className = ' ';
        }
        bullets[pos].className = "bk-active";
        
        //disable the button if bound are reached
        var prevBtn = Bk.Dom.getElementsByAttribute(divCarousel, "a", "data-bk-role", "prev")[0];
        var nextBtn = Bk.Dom.getElementsByAttribute(divCarousel, "a", "data-bk-role", "next")[0];
        
        if(pos == 0){    //so, disable the left btn
            disableCarouselBtn(prevBtnObj);
            enableCarouselBtn(nextBtnObj);
            
        }else if(pos == bullets.length - 1){    //yo, disable the right btn
            disableCarouselBtn(nextBtnObj);
            enableCarouselBtn(prevBtnObj);
            
        }else {    //Enable both
            enableCarouselBtn(prevBtnObj);
            enableCarouselBtn(nextBtnObj);
        }
    }
    
    /**
     * @private
     * Object that represents Carousel button.
     * @param btn
     * @param onClickFn
     */
    function CarouselBtn(args){
        this.btn = args.btn;
        this.onClick = args.onClick;
        this.disable = function(){
            Bk.Event.removeListener("click", this.btn, this.onClick);
            Bk.Event.addListener("click", this.btn, _preventDefault);
        }
        this.enable = function(){
            Bk.Event.removeListener("click", this.btn, _preventDefault);
            Bk.Event.addListener("click", this.btn, this.onClick);    
        }
    }

    /**
     * @private
     */
    function disableCarouselBtn(carouselBtn){
        if(carouselBtn.btn.className.indexOf('bk-btn-off') < 0){    //if the class was already added, don't add it again.
            carouselBtn.btn.className = carouselBtn.btn.className + " bk-btn-off";
        }
        carouselBtn.disable();
    }
    
    /**
     * private
     */
    function enableCarouselBtn(carouselBtn){
        carouselBtn.btn.className = carouselBtn.btn.className.replace("bk-btn-off", ' ');       
        carouselBtn.enable();
    }
};
