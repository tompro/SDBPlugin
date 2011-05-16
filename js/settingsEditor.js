app.settingsEditor = (function(){
	
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
		editForm.hide();
		
		settings.onChanged(initConfigChooser);
	}
	
	/**
	 * setup buttons
	 */
	function setupButtons(){
		
		addSettingsButton.bind('click', function(){
			editForm.slideDown('medium');
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
			editForm.slideUp();
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