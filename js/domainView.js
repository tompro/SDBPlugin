app.domainView = (function(){
	
	var container, model, form;
	
	function init(){
		container = $('#sdbDomains');
		model = app.domain;
		model.onChanged(renderDomains);
	}
	
	function renderDomains( data ){
		
		container.html('');
		
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
