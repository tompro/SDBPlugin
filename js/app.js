var app = (function(){
	
	var version = '0.1';
	
	function getVersion(){
		return this.version;
	}
	
	return {
		version: getVersion
	};
}());
