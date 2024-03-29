(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof exports !== "undefined") {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(function ($) {
  var Zippy = (function (element, settings) {
    var instanceUid = 0;

    function _Zippy(element, settings) {
      this.defaults = {
        slideDuration: "3000",
        speed: 500,
        arrowRight: ".arrow-right",
        arrowLeft: ".arrow-left",
      };

      this.settings = $.extend({}, this, this.defaults, settings);

      this.initials = {
        currSlide: 0,
        $currSlide: null,
        totalSlides: false,
        csstransitions: false,
      };

      $.extend(this, this.initials);

      this.$el = $(element);

      this.changeSlide = $.proxy(this.changeSlide, this);

      this.init();

      this.instanceUid = instanceUid++;
    }

    return _Zippy;
  })();

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.init = function () {
    this.csstransitionsTest();
    this.$el.addClass("zippy-carousel");
    this.build();
    this.events();
    this.activate();
    this.initTimer();
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.csstransitionsTest = function () {
    var elem = document.createElement("modernizr");
    var props = [
      "transition",
      "WebkitTransition",
      "MozTransition",
      "OTransition",
      "msTransition",
    ];
    for (var i in props) {
      var prop = props[i];
      var result = elem.style[prop] !== undefined ? prop : false;
      if (result) {
        this.csstransitions = result;
        break;
      }
    }
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.addCSSDuration = function () {
    var _ = this;
    this.$el.find(".slide").each(function () {
      this.style[_.csstransitions + "Duration"] = _.settings.speed + "ms";
    });
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.removeCSSDuration = function () {
    var _ = this;
    this.$el.find(".slide").each(function () {
      this.style[_.csstransitions + "Duration"] = "";
    });
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.build = function () {
    var $indicators = this.$el
      .append('<ul class="indicators" >')
      .find(".indicators");
    this.totalSlides = this.$el.find(".slide").length;
    for (var i = 0; i < this.totalSlides; i++)
      $indicators.append("<li data-index=" + i + ">");
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.activate = function () {
    this.$currSlide = this.$el.find(".slide").eq(0);
    this.$el.find(".indicators li").eq(0).addClass("active");
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.events = function () {
    $("body")
      .on(
        "click",
        this.settings.arrowRight,
        { direction: "right" },
        this.changeSlide
      )
      .on(
        "click",
        this.settings.arrowLeft,
        { direction: "left" },
        this.changeSlide
      )
      .on("click", ".indicators li", this.changeSlide);
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.clearTimer = function () {
    if (this.timer) clearInterval(this.timer);
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.initTimer = function () {
    this.timer = setInterval(this.changeSlide, this.settings.slideDuration);
  };

  /**
   * @params void
   * @returns void
   *
   */
  Zippy.prototype.startTimer = function () {
    this.initTimer();
    this.throttle = false;
  };

  /**
   * MAIN LOGIC HANDLER
   * @params	object	event
   * @returns void
   *
   */
  Zippy.prototype.changeSlide = function (e) {
    if (this.throttle) return;
    this.throttle = true;

    this.clearTimer();

    var direction = this._direction(e);

    var animate = this._next(e, direction);
    if (!animate) return;

    var $nextSlide = this.$el
      .find(".slide")
      .eq(this.currSlide)
      .addClass(direction + " active");

    if (!this.csstransitions) {
      this._jsAnimation($nextSlide, direction);
    } else {
      this._cssAnimation($nextSlide, direction);
    }
  };

  /**
   * @params	object	event
   * @returns strong	animation direction
   *
   */
  Zippy.prototype._direction = function (e) {
    var direction;

    // Default to forward movement
    if (typeof e !== "undefined") {
      direction = typeof e.data === "undefined" ? "right" : e.data.direction;
    } else {
      direction = "right";
    }
    return direction;
  };

  /**
   * @params	object	event
   * @params	string	animation direction
   * @returns boolean continue to animate?
   *
   */
  Zippy.prototype._next = function (e, direction) {
    var index =
      typeof e !== "undefined" ? $(e.currentTarget).data("index") : undefined;

    switch (true) {
      case typeof index !== "undefined":
        if (this.currSlide == index) {
          this.startTimer();
          return false;
        }
        this.currSlide = index;
        break;
      case direction == "right" && this.currSlide < this.totalSlides - 1:
        this.currSlide++;
        break;
      case direction == "right":
        this.currSlide = 0;
        break;
      case direction == "left" && this.currSlide === 0:
        this.currSlide = this.totalSlides - 1;
        break;
      case direction == "left":
        this.currSlide--;
        break;
    }
    return true;
  };

  /**

       * @params	object	Jquery object the next slide to slide into view
       * @params	string	animation direction
       * @returns void
       *
       */
  Zippy.prototype._cssAnimation = function ($nextSlide, direction) {
    setTimeout(
      function () {
        this.$el.addClass("transition");
        this.addCSSDuration();
        this.$currSlide.addClass("shift-" + direction);
      }.bind(this),
      100
    );

    setTimeout(
      function () {
        this.$el.removeClass("transition");
        this.removeCSSDuration();
        this.$currSlide.removeClass("active shift-left shift-right");
        this.$currSlide = $nextSlide.removeClass(direction);
        this._updateIndicators();
        this.startTimer();
      }.bind(this),
      100 + this.settings.speed
    );
  };

  /**

       * @params	object	Jquery object the next slide to slide into view
       * @params	string	animation direction
       * @returns void
       *
       */
  Zippy.prototype._jsAnimation = function ($nextSlide, direction) {
    var _ = this;

    if (direction == "right") _.$currSlide.addClass("js-reset-left");

    var animation = {};
    animation[direction] = "0%";

    var animationPrev = {};
    animationPrev[direction] = "100%";

    this.$currSlide.animate(animationPrev, this.settings.speed);

    $nextSlide.animate(animation, this.settings.speed, "swing", function () {
      _.$currSlide.removeClass("active js-reset-left").attr("style", "");

      _.$currSlide = $nextSlide.removeClass(direction).attr("style", "");
      _._updateIndicators();
      _.startTimer();
    });
  };

  /**

       * @params	void
       * @returns	void
       *
       */
  Zippy.prototype._updateIndicators = function () {
    this.$el
      .find(".indicators li")
      .removeClass("active")
      .eq(this.currSlide)
      .addClass("active");
  };

  /**
   * @params	object	options object
   * @returns void
   *
   */
  $.fn.Zippy = function (options) {
    return this.each(function (index, el) {
      el.Zippy = new Zippy(el, options);
    });
  };
});

var args = {
  arrowRight: ".arrow-right",
  arrowLeft: ".arrow-left",
  speed: 1000,
  slideDuration: 4000,
};

$(".carousel").Zippy(args);
