app.domainView = (function(){
	
	var container, model, domainFormElement, formButton, deleteButton;
	var domainClickedCallbacks = [];
	
	function init(){
		container = $('#sdbDomains');
		domainFormElement = $('#domainName');
		formButton = $('#saveDomain');
		
		formButton.bind('click', function(event){
			event.preventDefault();
			var domainName = domainFormElement.val();
			model.addDomain(domainName);
		});
		
		container.find('li').live('click', domainClicked);
		
		model = app.domain;
		model.onChanged(renderDomains);
	}
	
	function renderDomains( domains ){
		container.html('');
		_.each(domains, function(item, index){
			var elem = $('<li><span class="domain">' + item + '</span></li>');
			container.append(elem);
		});
	}
	
	function domainClicked(){
		var domain = $(this);
		container.find('li').removeClass('active');
		container.find('#deleteDomain').remove();
		domain.addClass('active');
		
		var deleteButton = $('<a href="#" id="deleteDomain" title="Delete this Domain">X</a>');
		deleteButton.bind('click', function(){
			var domainName = $($(this).parent().find('.domain')[0]).html();
			model.deleteDomain(domainName);
		});
		domain.append(deleteButton);
		
		app.executeCallbacks(domainClickedCallbacks);
	}
	
	function onDomainClicked( callback ){
		if(typeof callback == 'function'){
			domainClickedCallbacks.push(callback);
		}
	}
	
	return {
		init: init,
		renderDomains: renderDomains,
		onDomainClicked: onDomainClicked
	}
	
}())
