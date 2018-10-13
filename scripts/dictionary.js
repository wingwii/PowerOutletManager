function CreateDictionary() {
	var instance = new Object();
	
	instance.mDictionaryKeyPrefix = "{9E28CD3A-C514-4058-9C13-9A5976B46275} ";
	instance.mItemCount = 0;
	
	instance.GetDictionaryActualKey = function(key) {
		return (this.mDictionaryKeyPrefix + key);
	};
	
	instance.GetItemCount = function() {
		return this.mItemCount;
	}
	
	instance.AddItem = function(key, value) {
		var actualKey = this.GetDictionaryActualKey(key);
		var existing = (actualKey in this);
		this[actualKey] = value;
		if (!existing) {
			++this.mItemCount;
		}
	};
	
	instance.RemoveItem = function(key) {
		var actualKey = this.GetDictionaryActualKey(key);
		if (actualKey in this) {
			delete this[actualKey];		
			--this.mItemCount;
		}
	};
	
	instance.ContainKey = function(key) {
		var actualKey = this.GetDictionaryActualKey(key);
		return (actualKey in this);
	};
	
	instance.GetItem = function(key) {
		var actualKey = this.GetDictionaryActualKey(key);
		if (actualKey in this) {
			return this[actualKey];
		}
		else {
			return undefined;
		}
	};
	
	instance.EnumItem = function(state, callback) {
		if (null == callback) {
			return;
		}
		
		var keyPrefixLen = this.mDictionaryKeyPrefix.length;
		var keys = Object.keys(this);
		var n = keys.length;
		for (var i = 0; i < n; ++i) {
			var key = keys[i];
			if (key.length < keyPrefixLen) {
				continue;
			}			
			if (key.substr(0, keyPrefixLen) != this.mDictionaryKeyPrefix) {
				continue;
			}			
			var value = this[key];
			key = key.substr(keyPrefixLen);
			callback(state, key, value);
		};
	};
	
	return instance;	
}
