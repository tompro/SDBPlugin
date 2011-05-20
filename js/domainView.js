app.domainView = (function(){
	
	var container, model, domainFormElement, formButton;
	
	function init(){
		container = $('#sdbDomains');
		domainFormElement = $('#domainName');
		formButton = $('#saveDomain');
		
		formButton.bind('click', function(event){
			event.preventDefault();
			var domainName = domainFormElement.val();
			model.addDomain(domainName);
		});
		
		model = app.domain;
		model.onChanged(renderDomains);
	}
	
	function renderDomains( domains ){
		container.html('');
		_.each(domains, function(item, index){
			var elem = $('<li class="domain">' + item + '</li>');
			elem.bind('click', onDomainClicked);
			container.append(elem);
		});
	}
	
	function onDomainClicked(){
		var domain = $(this).html();
		console.log('Domain clicked: ' + domain);
	}
	
	return {
		init: init,
		renderDomains: renderDomains
	}
	
}())
