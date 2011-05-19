app.sdb = (function(){
	
	var sdb, awsDomain, awsKey, awsSecret, sdb;
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
		
	}
	
	function deleteDomain( domainName, callback){
		
	}
	
	function onChanged( callback ){
		if(typeof callback == 'function'){
			onChangedCallbacks.push(callback);
		}
	}
	
	init();
	
	return {
		onChanged: onChanged,
		listDomains: listDomains,
		createDomain: createDomain,
		deleteDomain: deleteDomain
	};
	
}())
