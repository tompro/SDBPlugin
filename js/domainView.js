app.domainView = (function(){
	
	var container, form;
	
	function init(){
		container = $('#sdbDomains');
	}
	
	function renderDomains( data ){
		
		_.each(data.domains, function(item, index){
			var elem = $('<li>' + item + '</li>');
			elem.bind('click', function(){
				var domain = $(this).html();
				console.log('Domain clicked: ' + domain);
			});
			container.append(elem);
		});
		
	}
	
	return {
		init: init,
		renderDomains: renderDomains
	}
	
}())
