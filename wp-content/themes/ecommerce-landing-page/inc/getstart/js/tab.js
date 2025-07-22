function ecommerce_landing_page_open_tab(evt, cityName) {
    var ecommerce_landing_page_i, ecommerce_landing_page_tabcontent, ecommerce_landing_page_tablinks;
    ecommerce_landing_page_tabcontent = document.getElementsByClassName("tabcontent");
    for (ecommerce_landing_page_i = 0; ecommerce_landing_page_i < ecommerce_landing_page_tabcontent.length; ecommerce_landing_page_i++) {
        ecommerce_landing_page_tabcontent[ecommerce_landing_page_i].style.display = "none";
    }
    ecommerce_landing_page_tablinks = document.getElementsByClassName("tablinks");
    for (ecommerce_landing_page_i = 0; ecommerce_landing_page_i < ecommerce_landing_page_tablinks.length; ecommerce_landing_page_i++) {
        ecommerce_landing_page_tablinks[ecommerce_landing_page_i].className = ecommerce_landing_page_tablinks[ecommerce_landing_page_i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

jQuery(document).ready(function () {
    jQuery( ".tab-sec .tablinks" ).first().addClass( "active" );
});