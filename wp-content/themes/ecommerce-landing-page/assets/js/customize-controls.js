( function( api ) {

	// Extends our custom "ecommerce-landing-page" section.
	api.sectionConstructor['ecommerce-landing-page'] = api.Section.extend( {

		// No events for this type of section.
		attachEvents: function () {},

		// Always make the section active.
		isContextuallyActive: function () {
			return true;
		}
	} );

} )( wp.customize );