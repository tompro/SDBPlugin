/**
 * 
 * view for domain listing
 * 
 */
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
		var domainName = $(domain.find('.domain')[0]).html();
		
		container.find('li').removeClass('active');
		container.find('#deleteDomain').remove();
		domain.addClass('active');
		
		var deleteButton = $('<a href="#" id="deleteDomain" title="Delete this Domain">X</a>');
		deleteButton.bind('click', function(){
			model.deleteDomain(domainName);
		});
		domain.append(deleteButton);
		app.executeCallbacks(domainClickedCallbacks, domainName);
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

/**
 * 
 * View for settings dialog
 * 
 */
app.settingsView = (function(){
	
	var regionSelect, awsSelect, addSettingsButton, editForm, saveButton, configChooser, settings;
	var settingsSavedCallbacks = [];
	var settingsChangedCallbacks = [];
	var errors = [];
	
	/**
	 * inits the settings editor
	 */
	function init( availableSettings ){
		
		settings = availableSettings;
		editForm = $('#editSettings');
		regionSelect = $('#awsRegionSelect');
		awsSelect = $('#preferenceSelect');
		addSettingsButton = $('#addSetting');
		saveButton = $('#saveSetting');
		
		
		initConfigChooser();
		initRegionChooser();
		setupButtons();
		$('.settingsContainer').hide();
		
		settings.onChanged(initConfigChooser);
	}
	
	/**
	 * setup buttons
	 */
	function setupButtons(){
		
		addSettingsButton.bind('click', function(){
			$('.settingsContainer').slideDown('medium');
		});
		
		editForm.find('.cancel').bind('click', function(){
			$('.settingsContainer').slideUp('medium');
		});
		
		saveButton.bind('click', function(event){
			event.preventDefault();
			data = {};
			valid = true;
			
			editForm.find('input').each(function(index, item){
				if(item.name == 'name' || item.name == 'awsKey' || item.name == 'awsSecret'){
					if(item.value == ''){
						addError(item);
						valid = false;
					}
					data[item.name] = item.value;
				}
			});
			
			if( ! valid ){
				return;
			}
			editForm.find('input').each(function(index, item){
				if(item.name == 'name' || item.name == 'awsKey' || item.name == 'awsSecret'){
					item.value = '';
				}
			});
			$('.settingsContainer').slideUp('medium');
			app.executeCallbacks(settingsSavedCallbacks, data);
		});
		
	}
	
	/**
	 * init config select
	 */
	function initConfigChooser(){
		awsSelect.html('');
		awsSelect.unbind();
		
		_.each(settings.getSettings(), function(setting, key){
			awsSelect.append('<option value="'+key+'">'+setting.name+'</option>');
		});
		
		awsSelect.val(settings.getSelectedIndex());
		
		awsSelect.bind('change', function(){
			app.executeCallbacks(settingsChangedCallbacks, { setting: 'config', value: $(this).val() });
		});
	}
	
	/**
	 * initializes the region chooser
	 */
	function initRegionChooser(){
		_.each(settings.getRegions(), function(region, key){
			regionSelect.append('<option value="'+key+'">'+key+'</option>');
		});
		
		regionSelect.val(settings.getSelectedRegionKey());
		
		regionSelect.bind('change', function(){
			app.executeCallbacks(settingsChangedCallbacks, { setting: 'region', value: $(this).val() });
		});
	}
	
	/**
	 * add a form error
	 */
	function addError(item){
		$(item).parent().append('<p class="error">' + item.name + ' can not be empty!</p>');
		$(item).one('change', function(){
			$(this).parent().find('.error').remove();
		});
	}
	
	/**
	 * adds a callback for settings saved event
	 */
	function onSettingsSaved(callback){
		if(typeof callback == 'function'){
			settingsSavedCallbacks.push(callback);
		}
	}
	
	/**
	 * adds a callback for settings changed event
	 */
	function onSettingsChanged(callback){
		if(typeof callback == 'function'){
			settingsChangedCallbacks.push(callback);
		}
	}
	
	return {
		init: init,
		onSettingsSaved: onSettingsSaved,
		onSettingsChanged: onSettingsChanged
	};
}())

/**
 * 
 * query result table view
 * 
 */
app.queryResultView = (function(){
	
	var table, model;
	var columns = [];
	
	function init(){
		table = $('#queryResult');
		model = app.queryResult;
		model.onChanged(buildResultTable);
	}
	
	/**
	 * collects and sorts result columns
	 */
	function buildResultColumns( data ){
		_.each(data, function(item, index){
			_.each(item.attrs, function( value, key ){
				if(_.indexOf(columns, key) == -1){
					columns.push(key);
				}
			});
		});
		
		columns.sort();
	}
	
	/**
	 * renders the result table head
	 */
	function renderTableHead(){
		var head = $('<tr></tr>');
		_.each(columns, function(value){
			head.append('<th>' + value + '</th>');
		});
		table.append(head);
	}
	
	/**
	 * renders a single result row
	 */
	function renderResultRow( item ){
		var row = $('<tr></tr>');
		_.each(columns, function(name){
			row.append('<td>'+(item.attrs[name] ? item.attrs[name] : '')+'</td>');
		});
		table.append(row);
	}
	
	/**
	 * renders the result table
	 */
	function buildResultTable(data){
		
		clearTable();
		
		buildResultColumns(data);
		renderTableHead();
		
		_.each(data, function(item, index){
			renderResultRow(item);
		});
	}
	
	function clearTable(){
		columns = [];
		table.html('');
	}
	
	return {
		init: init,
		buildResultTable: buildResultTable
	};
	
}());

/**
 * view for the query editor
 */
app.queryView = (function(){
	
	var queryEditor, queryButton, model;
	
	function init(){
		queryEditor = $('#query');
		queryButton = $('#doQuery');
		
		queryEditor.bind('keypress', function(event){
			var keyCode = (event.keyCode ? event.keyCode : event.which);
			if(keyCode == 13){
				doQuery();
				event.preventDefault();
			}
		});
		
		queryButton.bind('click', function(event){
			event.preventDefault();
			doQuery();
		});
		
		model = app.queryResult;
	}
	
	function doQuery(){
		
		var queryString = queryEditor.val();
		if(queryString !== ''){
			model.query(queryString);
		}
	}
	
	return {
		init: init
	};
}());
