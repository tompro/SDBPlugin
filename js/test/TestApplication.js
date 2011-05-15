TestCase('TestApplicationBootstrap', {
	'test application has loaded': function(){
		assertObject(app);
		assertFunction(app.version);
	}
});
