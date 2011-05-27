/**
 * model for settings
 */
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
}());

/**
 * wrapper for sdb connector
 */
app.sdb = (function(){
	
	var sdb, awsDomain, awsKey, awsSecret, sdb, queryResult;
	var settings = app.settings;
	var onChangedCallbacks = [];
	
	function init(){
		settings.onChanged(initSDB);
		initSDB();
	}
	
	function initSDB(){
		var settingsObject = settings.getSelectedEntry();
		awsKey = settingsObject.awsKey;
		awsSecret = settingsObject.awsSecret;
		awsDomain = settings.getSelectedRegion();
		
		console.log('Init SDB with Domain: ' + awsDomain);
		sdb = new SDB(awsKey, awsSecret, awsDomain);
		app.executeCallbacks(onChangedCallbacks);
	}
	
	function listDomains( callback ){
		sdb.listDomains(callback);
	}
	
	function createDomain( domainName, callback ){
		sdb.createDomain(domainName, callback);
	}
	
	function deleteDomain( domainName, callback){
		sdb.deleteDomain(domainName, callback);
	}
	
	function onChanged( callback ){
		if(typeof callback == 'function'){
			onChangedCallbacks.push(callback);
		}
	}
	
	function select( query, callback ){
		sdb.select(query, callback);
	}
	
	init();
	
	return {
		onChanged: onChanged,
		listDomains: listDomains,
		createDomain: createDomain,
		deleteDomain: deleteDomain,
		select: select
	};
	
}());

/**
 * model for domains
 */
app.domain = (function(){
	
	var onChangedCallbacks = [];
	var sdb = app.sdb;
	var domains = [];
	
	
	function load(){
		sdb.listDomains(loaded);
		sdb.onChanged(reload);
	}
	
	function reload(){
		sdb.listDomains(loaded);
	}
	
	function loaded(data){
		domains = data.domains;
		app.executeCallbacks(onChangedCallbacks, domains);
	}
	
	function addDomain( domainName ){
		if(domainName != '' && !domainExists(domainName))
		{
			sdb.createDomain(domainName, function(){
				domains.unshift(domainName);
				app.executeCallbacks(onChangedCallbacks, domains);
			});
		}
	}
	
	function deleteDomain( domainName ){
		if(confirm('Do you really want to delete the domain: ' + domainName + '? All data in this domain will be lost.'))
		{
			sdb.deleteDomain(domainName, function(){
				delete domains[_.indexOf(domains, domainName)];
				app.executeCallbacks(onChangedCallbacks, domains);
			});
		}
	}
	
	function domainExists( domain ){
		return (_.indexOf(domains, domain) != -1);
	}
	
	function onChanged( callback ){
		if(typeof callback == 'function'){
			onChangedCallbacks.push(callback);
		}
	}
	
	return {
		load: load,
		onChanged: onChanged,
		addDomain: addDomain,
		deleteDomain: deleteDomain	
	}
}());

/**
 * model for query results
 */
app.queryResult = (function(){
	
	var sdb = app.sdb;
	var result = {};
	var onChangedCallbacks = [];
	
	function reset(){
		queryResult({});
	}
	
	function query( query ){
		sdb.select(query, queryResult);
	}
	
	function queryResult( data ){
		result = data;
		console.log(result);
		app.executeCallbacks(onChangedCallbacks, result.items);
	}
	
	function onChanged( callback ){
		if(typeof callback == 'function'){
			onChangedCallbacks.push(callback);
		}
	}
	
	return {
		onChanged: onChanged,
		query: query
	};
}());
