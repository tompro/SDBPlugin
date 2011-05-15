var app = (function(){
	
	var version = '0.1';
	var regionSelect = 'awsRegionSelect';
	var awsSelect = 'preferenceSelect';
	
	function init(){
		this.settings.initRegionChooser(regionSelect);
		this.settings.initConfigChooser(awsSecret);
		
	}
	
	/**
	 * returns the version of this application
	 */
	function getVersion(){
		return this.version;
	}
	
	return {
		version: getVersion,
		init: init
	};
}());

app.settings = (function(){
	
	var settings, selectedIndex, controller;
	var storageKey = 'sdbSettings';
	
	var regions = {
		'us-east':'sdb.amazonaws.com',
		'us-west':'sdb.us-west-1.amazonaws.com',
		'eu-west':'sdb.eu-west-1.amazonaws.com',
 		'ap-southeast':'sdb.ap-southeast-1.amazonaws.com'
	};
	
	function initConfigEditor(){
		
	}
	
	function initConfigChooser( htmlId ){
		var configChooser = $('#'+htmlId);
		_.each(getSettings(), function(setting, key){
			configChooser.append('<option value="'+key+'">'+setting.name+'</option>');
		});
		
		configChooser.bind('change', function(){
			console.log('RELOAD APP WITH NEW SETTINGS: ' + $(this).val());
		});
	}
	
	/**
	 * initializes the region chooser
	 */
	function initRegionChooser( htmlId ){
		var regionChooser = $('#'+htmlId);
		_.each(getRegions(), function(region, key){
			regionChooser.append('<option value="'+key+'">'+key+'</option>');
		});
		
		regionChooser.bind('change', function(){
			console.log('RELOAD APP WITH NEW REGION: ' + $(this).val());
		});
	}
	
	/**
	 * returns the settings object
	 */
	function getSettings(){
		if( ! settings ){
			settings = load();
		}
		return settings;
	}
	
	/**
	 * loads settings object from local storage or creates a
	 * new empty settings object
	 */
	function load(){
		var result = [];
		var settingsString = localStorage.getItem( storageKey );
		if(settingsString){
			result = JSON.parse(settingsString);
		}
		return result;
	}
	
	/**
	 * saves the current settings object to local storage
	 */
	function save(){
		localStorage.setItem(
			storageKey, JSON.stringify(getSettings())
		);
	}
	
	/**
	 * adds a new settings entry
	 */
	function addEntry( entry ){

		if(!entry.name){
			return false;
		}
		if(getEntryByName(entry.name) == false){
			getSettings().push( entry );
			save();
			return true;
		}
		return false;
	}
	
	/**
	 * returns a config entry by its name
	 */
	function getEntryByName( name ){
		var settingsObject = getSettings();
		for(var i=0; i<settingsObject.length; i++){
			if(settingsObject[i].name == name)
			{
				return settingsObject[i];
			}
		}
		return false;
	}
	
	/**
	 * deletes a config entry from local storage
	 */
	function removeEntry( name ){
		var settingsObject = getSettings();
		_.each(settingsObject, function(settingsEntry, index){
			if(settingsEntry.name == name)
			{
				delete settingsObject[index];
			}
		});
		settings = settingsObject;
		save();
	}
	
	/**
	 * returns a config entry by its index
	 */
	function getEntry( id ){
		return getSettings()[id];
	}
	
	/**
	 * clears settings and deletes them from local storage
	 */
	function clearSettings(){
		settings = [];
		localStorage.removeItem(storageKey);
	}
	
	/**
	 * returns all available SDB regions
	 */
	function getRegions(){
		return regions;
	}
	
	return {
		addEntry: addEntry,
		removeEntry: removeEntry,
		getEntry: getEntry,
		getEntryByName: getEntryByName,
		getSettings: getSettings,
		clearSettings: clearSettings,
		getRegions: getRegions,
		initRegionChooser: initRegionChooser,
		initConfigChooser: initConfigChooser,
		initConfigEditor: initConfigEditor
	};
}())






