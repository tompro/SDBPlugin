app.settings = (function(){
	
	var settings, selectedIndex, selectedRegion, controller;
	var storageKey = 'sdbSettings';
	var recentSettingsKey = 'recentSdbSetting';
	var recentRegionKey = 'recentSdbRegion';
	
	var changedCallbacks = [];
	
	var regions = {
		'us-east':'sdb.amazonaws.com',
		'us-west':'sdb.us-west-1.amazonaws.com',
		'eu-west':'sdb.eu-west-1.amazonaws.com',
 		'ap-southeast':'sdb.ap-southeast-1.amazonaws.com'
	};
	
	function init(){
		var recentSettingsIndex = localStorage.getItem( recentSettingsKey );
		if(recentSettingsIndex){
			selectEntry(recentSettingsIndex);
		}else{
			selectEntry(0);
		}
		
		var recentRegion = localStorage.getItem( recentRegionKey );
		if(recentRegion){
			selectRegion(recentRegion);
		}
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
			app.executeCallbacks(changedCallbacks);
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
		app.executeCallbacks(changedCallbacks);
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
		app.executeCallbacks(changedCallbacks);
	}
	
	/**
	 * returns all available SDB regions
	 */
	function getRegions(){
		return regions;
	}
	
	function getSelectedIndex(){
		return selectedIndex;
	}
	
	function getSelectedRegionKey(){
		return selectedRegion;
	}
	
	/**
	 * adds a on changed callback function
	 */
	function onChanged(callback){
		if(typeof callback == 'function'){
			changedCallbacks.push(callback);
		}
	}
	
	function selectEntry( index ){
		if(index >= 0 && index < getSettings().length ){
			selectedIndex = index;
			localStorage.setItem(recentSettingsKey, index);
			app.executeCallbacks(changedCallbacks, getSelectedEntry());
		}
	}
	
	function getSelectedEntry(){
		if(selectedIndex && getSettings().length > 0){
			return getSettings()[selectedIndex];
		}
	}
	
	function selectRegion( region ){
		_.each(getRegions(), function(regionValue, key){
			if(region == key){
				selectedRegion = region;
				localStorage.setItem(recentRegionKey, region);
				app.executeCallbacks(changedCallbacks, getSelectedEntry());
				return;
			}
		});
	}
	
	function getSelectedRegion(){
		if(selectedRegion){
			return getRegions()[selectedRegion];
		}
		_.each(getRegions(), function(region, key){
			return region;
		});
	}
	
	function changeSettings( settingsObject ){
		if(settingsObject && settingsObject.setting){
			if(settingsObject.setting == 'config'){
				selectEntry(settingsObject.value);
			}else if(settingsObject.setting == 'region'){
				selectRegion(settingsObject.value);
			}
		}
	}
	
	init();
	
	return {
		addEntry: addEntry,
		removeEntry: removeEntry,
		getEntry: getEntry,
		getEntryByName: getEntryByName,
		getSettings: getSettings,
		clearSettings: clearSettings,
		getRegions: getRegions,
		onChanged: onChanged,
		selectEntry: selectEntry,
		getSelectedEntry: getSelectedEntry,
		getSelectedRegion: getSelectedRegion,
		changeSettings: changeSettings,
		getSelectedIndex: getSelectedIndex,
		getSelectedRegionKey: getSelectedRegionKey
	};
}())