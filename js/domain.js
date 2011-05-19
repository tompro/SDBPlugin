app.domain = (function(){
	
	var onChangedCallbacks = [];
	var sdb = app.sdb;
	var domains = [];
	
	
	function load(){
		sdb.listDomains(loaded);
		sdb.onChanged(reload);
	}
	
	function reload(){
		console.log('reload domains');
		sdb.listDomains(loaded);
	}
	
	function loaded(data){
		console.log('domains loaded in domains');
		domains = data;
		app.executeCallbacks(onChangedCallbacks, domains);
	}
	
	function onChanged( callback ){
		if(typeof callback == 'function'){
			onChangedCallbacks.push(callback);
		}
	}
	
	return {
		load: load,
		onChanged: onChanged
	}
}())
