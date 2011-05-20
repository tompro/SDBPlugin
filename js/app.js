var app = (function(){
	
	var version = '0.1';
	var regionSelect = 'awsRegionSelect';
	var awsSelect = 'preferenceSelect';
	
	function init(){
		
		this.settingsEditor.init( this.settings );
		this.settingsEditor.onSettingsSaved(this.settings.addEntry);
		this.settingsEditor.onSettingsChanged(this.settings.changeSettings);
		
		this.domainView.init();
		this.domain.load();
	}
	
	/**
	 * returns the version of this application
	 */
	function getVersion(){
		return this.version;
	}
	
	/**
	 * executes an array of functions with optional data as argument
	 */
	function executeCallbacks(callbacks, data){
		_.each(callbacks, function(callback){
			try{
				callback(data);
			}catch(e){}
		});
	}
	
	return {
		version: getVersion,
		init: init,
		executeCallbacks: executeCallbacks
	};
}());