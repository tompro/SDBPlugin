/**
 * top menu view
 */
app.menuView = (function(){
	
	var domainForm, addDomainMenu;
	
	/**
	 * init this view
	 */
	function init(){
		addDomainMenu = $('#addDomain');
		addDomainMenu.bind('click', function(event){
			event.preventDefault();
			$('.domainFormContainer').slideDown('medium');
		});
	}
	
	return {
		init: init
	};
	
}());

/**
 * controlls hideable container views
 */
app.containerView = (function(){
	
	var closeButonClass = 'closeContainer';
	var containerClass = 'container';
	
	/**
	 * init this view
	 */
	function init(){
		$('.'+closeButonClass).bind('click', function(event){
			event.preventDefault();
			$(this).parents('.'+containerClass).slideUp('medium');
		});
	}
	
	return {
		init: init
	};
	
}());

/**
 * 
 * view for domain listing
 * 
 */
app.domainView = (function(){
	
	var container, model, domainFormElement, formButton, deleteButton;
	var domainClickedCallbacks = [];
	
	/**
	 * init this view
	 */
	function init(){
		container = $('#sdbDomains');
		domainFormElement = $('#domainName');
		formButton = $('#saveDomain');
		
		formButton.bind('click', function(event){
			event.preventDefault();
			var domainName = domainFormElement.val();
			model.addDomain(domainName);
		});
		
		$('.domainFormContainer').hide();
		
		container.find('li').live('click', domainClicked);
		
		model = app.domain;
		model.onChanged(renderDomains);
	}
	
	/**
	 * renders all domains as list
	 */
	function renderDomains( domains ){
		container.html('');
		_.each(domains, function(item, index){
			var elem = $('<li><span class="domain">' + item + '</span></li>');
			container.append(elem);
		});
	}
	
	/**
	 * domain clicked event handler
	 */
	function domainClicked(){
		var domain = $(this);
		var domainName = $(domain.find('.domain')[0]).html();
		
		container.find('li').removeClass('active');
		container.find('#deleteDomain').remove();
		domain.addClass('active');
		
		var deleteButton = $('<a href="#" class="abutton delete deleteDomain" id="deleteDomain" title="Delete this Domain">X</a>');
		deleteButton.bind('click', function(){
			model.deleteDomain(domainName);
		});
		domain.append(deleteButton);
		app.executeCallbacks(domainClickedCallbacks, domainName);
	}
	
	/**
	 * adds eventhandler for domain item clicks
	 */
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
	
	var table, tableHead, tableBody, model;
	var columns = [];
	
	/**
	 * initialize this view
	 */
	function init(){
		table = $('#queryResult');
		tableHead = $('<thead></thead>');
		tableBody = $('<tbody></tbody>');
		table.append(tableHead);
		table.append(tableBody);
		
		$('tbody tr').live('click', selectItem);
		
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
		head.append('<th><div>Item Name</div></th>');
		_.each(columns, function(value){
			head.append('<th><div>' + value + '</div></th>');
		});
		tableHead.append(head);
	}
	
	/**
	 * renders a single result row
	 */
	function renderResultRow( item ){
		var row = $('<tr id="' + item.name + '"></tr>');
		row.append('<td><div title="'+item.name+'">'+item.name+'</div></td>');
		
		_.each(columns, function(name){
			row.append('<td><div title="'+(item.attrs[name] ? item.attrs[name] : '')+'">'+(item.attrs[name] ? item.attrs[name] : '')+'</div></td>');
		});
		tableBody.append(row);
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
	
	/**
	 * clears the complete table view
	 */
	function clearTable(){
		columns = [];
		tableHead.html('');
		tableBody.html('');
	}
	
	function selectItem( event ){
		var itemName = $(event.currentTarget).attr('id');
		model.selectItem(itemName);
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
	
	/**
	 * setup this view
	 */
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
	
	/**
	 * run a query
	 */
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

/**
 * form view for editing items
 */
app.itemFormView = (function(){
	
	var model, container, form, queryResultContainer;
	
	
	function init(){
		model = app.queryResult;
		model.onSelectionChanged(show);
		container = $('#itemFormContainer');
		queryResultContainer = $('#queryResult');
		
		$('#back').bind('click', hide);
		
		$('.deleteAttribute').live('click', deleteAttribute);
		$('#deleteItem').live('click', deleteItem);
		$('#itemFormContainer .deleteAttrValue').live('click', deleteAttributeValue);
		$('#itemFormContainer .add').live('click', addAttributeValue);
		model.onChanged(hide);
		
		form = $('<form></form>');
		container.append(form);
	}
	
	function show( item ){
		generateForm(item);
		container.show();
		queryResultContainer.hide();
	}
	
	function hide(){
		form.html('');
		container.hide();
		queryResultContainer.show();
	}
	
	function deleteAttribute(){
		$(this).parents('.attributeForm').slideUp('medium');
	}
	
	function deleteAttributeValue(){
		$(this).parents('p').slideUp('medium');
	}
	
	function addAttributeValue(){
		var attributeContainer = $($(this).parents('.attributeForm')[0]);
		var attributeName = $(attributeContainer.find('label')[0]).html();
		// TODO: attribute name has to have correct index for name
		attributeContainer.append(getAttributeValueFormElement(attributeName));
	}
	
	function deleteItem(){
		if(confirm('Do you really want to delete this item?')){
			hide();
		}
	}
	
	function generateForm( item ){
		form.html('');
		var html = '';
		_.each(item.attributes, function(values, name){
			html += getAttributeForm(name, values);
		});
		form.append(html);
		form.append('<input type="button" name="saveItem" value="save changes" />');
		container.append(form);
	}
	
	function getAttributeForm(name, values){
		var html = '<div class="attributeForm">';
		html += '<p class="attributeFormHeader"><label>'+name+'</label>';
		html += '<a class="abutton delete deleteAttribute" title="delete this attribute">x</a><a class="abutton add" title="add attribute value">+</a></p>';
		_.each(values, function(value, index){
			html += getAttributeValueFormElement(name+index, value);
		});
		html += '</div>';
		return html;
	}
	
	function getAttributeValueFormElement(name, value){
		value = value ? value : '';
		return '<p><input type="text" name="'+name+'" value="'+value+'" /><a class="abutton delete deleteAttrValue" title="delete this attribute value">X</a></p>';
	}
	
	
	return {
		init: init,
		hide: hide
	}
	
}());

