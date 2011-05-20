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
}())
