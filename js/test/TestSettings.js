TestCase('TestLocalStorageSettings', {
	
	storageKey : 'sdbSettings',
	
	setUp: function(){
		app.settings.clearSettings();
	},
	
	tearDown: function(){
		app.settings.clearSettings();
	},
	
	'test settings are initialized': function(){
		assertObject(app.settings);
		assertFunction(app.settings.getSettings);
	},
	
	'test getSettings returns object': function(){
		assertObject(app.settings.getSettings());
	},
	
	'test adding new settings entry is saved to local storage': function(){
		app.settings.addEntry({name: 'test'});
		var storageEntry = localStorage.getItem(this.storageKey);
		var obj = JSON.parse(storageEntry);
		assertEquals('test', obj[0].name);
	},
	
	'test adding settings entries without a name returns false': function(){
		assertFalse(app.settings.addEntry({some:'value'}));
	},
	
	'test adding entry returns true': function(){
		assertTrue(app.settings.addEntry({name:'testasdf'}));
	},
	
	'test adding settings entry with same name does return false': function(){
		app.settings.addEntry({name:'test'});
		assertFalse(app.settings.addEntry({name:'test'}));
	},
	
	'test clearSettings deletes all existing settings': function(){
		app.settings.addEntry({name:'asdf'});
		app.settings.clearSettings();
		assertNull( localStorage.getItem(this.storageKey) );
	},
	
	'test getEntryByName returns correct config object': function(){
		var testSetting = {name:'test1', someValue: 'test1Value'};
		app.settings.addEntry(testSetting);
		assertEquals(testSetting, app.settings.getEntryByName('test1'));
	},
	
	'test getRegions returns config object': function(){
		assertObject(app.settings.getRegions());
	}
	
	/*'test getSettings always returns the same object': function(){
		assertEquals(app.getSettings(), app.getSettings());
	},
	
	'test saveSettings produces no errors': function(){
		app.saveSettings();
	}*/
	
});
