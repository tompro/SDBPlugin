var app = (function(){
	
	var version = '0.1';
	var regionSelect = 'awsRegionSelect';
	var awsSelect = 'preferenceSelect';
	
	function init(){
		
		this.settingsView.init( this.settings );
		this.settingsView.onSettingsSaved(this.settings.addEntry);
		this.settingsView.onSettingsChanged(this.settings.changeSettings);
		
		this.domainView.init();
		this.domain.load();
		this.queryView.init();
		this.queryResultView.init();

		this.domainView.onDomainClicked(function( domainName ){
			app.queryResult.query(
				'select * from ' + domainName
			);
		});
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