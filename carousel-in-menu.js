Swipe.prototype.setup= function() {

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
    
    if(this.width === "auto"){
	this.width = window.innerWidth;
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

};

var oldOnTouchMove = Swipe.prototype.onTouchMove;

Swipe.prototype.onTouchMove = function(e) {
    e.preventDefault();
    oldOnTouchMove(e);
};


