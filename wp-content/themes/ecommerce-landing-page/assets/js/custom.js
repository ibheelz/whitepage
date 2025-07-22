function ecommerce_landing_page_menu_open_nav() {
	window.ecommerce_landing_page_responsiveMenu=true;
	jQuery(".sidenav").addClass('show');
}
function ecommerce_landing_page_menu_close_nav() {
	window.ecommerce_landing_page_responsiveMenu=false;
 	jQuery(".sidenav").removeClass('show');
}

jQuery(function($){
 	"use strict";
 	jQuery('.main-menu > ul').superfish({
		delay: 500,
		animation: {opacity:'show',height:'show'},
		speed: 'fast'
 	});
});

jQuery(document).ready(function () {
	window.ecommerce_landing_page_currentfocus=null;
  	ecommerce_landing_page_checkfocusdElement();
	var ecommerce_landing_page_body = document.querySelector('body');
	ecommerce_landing_page_body.addEventListener('keyup', ecommerce_landing_page_check_tab_press);
	var ecommerce_landing_page_gotoHome = false;
	var ecommerce_landing_page_gotoClose = false;
	window.ecommerce_landing_page_responsiveMenu=false;
 	function ecommerce_landing_page_checkfocusdElement(){
	 	if(window.ecommerce_landing_page_currentfocus=document.activeElement.className){
		 	window.ecommerce_landing_page_currentfocus=document.activeElement.className;
	 	}
 	}
 	function ecommerce_landing_page_check_tab_press(e) {
		"use strict";
		// pick passed event or global event object if passed one is empty
		e = e || event;
		var activeElement;

		if(window.innerWidth < 999){
		if (e.keyCode == 9) {
			if(window.ecommerce_landing_page_responsiveMenu){
			if (!e.shiftKey) {
				if(ecommerce_landing_page_gotoHome) {
					jQuery( ".main-menu ul:first li:first a:first-child" ).focus();
				}
			}
			if (jQuery("a.closebtn.mobile-menu").is(":focus")) {
				ecommerce_landing_page_gotoHome = true;
			} else {
				ecommerce_landing_page_gotoHome = false;
			}

		}else{

			if(window.ecommerce_landing_page_currentfocus=="responsivetoggle"){
				jQuery( "" ).focus();
			}}}
		}
		if (e.shiftKey && e.keyCode == 9) {
		if(window.innerWidth < 999){
			if(window.ecommerce_landing_page_currentfocus=="header-search"){
				jQuery(".responsivetoggle").focus();
			}else{
				if(window.ecommerce_landing_page_responsiveMenu){
				if(ecommerce_landing_page_gotoClose){
					jQuery("a.closebtn.mobile-menu").focus();
				}
				if (jQuery( ".main-menu ul:first li:first a:first-child" ).is(":focus")) {
					ecommerce_landing_page_gotoClose = true;
				} else {
					ecommerce_landing_page_gotoClose = false;
				}

			}else{

			if(window.ecommerce_landing_page_responsiveMenu){
			}}}}
		}
	 	ecommerce_landing_page_checkfocusdElement();
	}
});

jQuery('document').ready(function($){
  $(window).scroll(function(){
	var sticky = $('.header-sticky'),
		scroll = $(window).scrollTop();

	if (scroll >= 100) sticky.addClass('header-fixed');
	else sticky.removeClass('header-fixed');
	});
  setTimeout(function () {
		jQuery("#preloader").fadeOut("slow");
  },1000);
});

jQuery(document).ready(function () {
	jQuery(window).scroll(function () {
    if (jQuery(this).scrollTop() > 100) {
      jQuery('.scrollup i').fadeIn();
    } else {
      jQuery('.scrollup i').fadeOut();
    }
	});
	jQuery('.scrollup i').click(function () {
    jQuery("html, body").animate({
      scrollTop: 0
    }, 600);
    return false;
	});
});

jQuery('#banner .slider-for').slick({
  slidesToShow: 1,
  infinite: true,
  arrows: false,
  autoplay:true,
  autoplaySpeed:5000,
  fade: true,
  asNavFor: '.slider-nav',

});
jQuery('#banner .slider-nav').slick({
  slidesToShow: 3,
  infinite: true,
  centerPadding: '0px',
  arrows: false,
  slidesToScroll: 1,
  asNavFor: '#banner .slider-for',
  dots: false,
  focusOnSelect: true,
	responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
})

jQuery(document).ready(function() {
  jQuery(".inner_carousel h1").each(function() {
    var t = jQuery(this).text();
    var splitT = t.split(" ");
    console.log(splitT);
    var lastWordIndex = splitT.length - 1; // Zero-based index for the last word
    var newText = "";
    for (var i = 0; i < splitT.length; i++) {
      if (i === lastWordIndex) {
        newText += "<span class='slider-color' style='color:#fff; background: #000; padding: 4px 12px;'>";
        newText += splitT[i];
        newText += "</span>";
      } else {
        newText += splitT[i] + " ";
      }
    }
    jQuery(this).html(newText);
  });
});