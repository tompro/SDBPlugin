app.sdb = (function(){
	
	var sdb, awsDomain, awsKey, awsSecret, sdb;
	var settings = app.settings;
	
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
	}
	
	function listDomains( callback ){
		sdb.listDomains(callback);
	}
	
	function createDomain( domainName, callback ){
		
	}
	
	function deleteDomain( domainName, callback){
		
	}
	
	init();
	
	return {
		listDomains: listDomains,
		createDomain: createDomain,
		deleteDomain: deleteDomain
	};
	
}())
