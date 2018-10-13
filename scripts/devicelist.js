var gInterval = 1000;
var gDeviceList = null;
var gNewDeviceList = null;
var gDomDeviceList = document.getElementById("DeviceList");

function RefreshList() {
	$.ajax({
		url: "enumdev.php",
		success: function(result) {
			try {
				UpdateList(result);
			}
			catch (err) { }
			setTimeout(RefreshList, gInterval);
		}
	});
}

function SaveDeviceState(device) {
	var deviceInfo = new Object();
	deviceInfo.hardwareID = device.hardwareID;
	deviceInfo.state = device.state;
	
	$.post(
		"devctl.php",
		JSON.stringify(deviceInfo),
		function(result) { }
	);
}

function BeginUpdateDeviceState(deviceID) {
	var device = gDeviceList.GetItem(deviceID);
	if (undefined == device) {
		return;
	}
	
	$.ajax({
		context: device,
		url: "devctl.php?hardwareID=" + device.hardwareID,
		success: function(result) {
			try {
				EndUpdateDeviceState(this, result);
			}
			catch (err) { }	
			this.domRowObj.RearmUpdateDeviceStateTimer();
		}
	});	
}

function EndUpdateDeviceState(device, state) {
	device.state = state;	
	device.domImgPwrSw.DeviceStateChanged();
	device.domDevNameObj.DeviceStateChanged();
}

function RemoveDeviceByID(deviceID) {
	var device = gDeviceList.GetItem(deviceID);
	gDeviceList.RemoveItem(deviceID);
	if (undefined == device) {
		return;
	}
	
	clearTimeout(device.updateDeviceStateTimerID);
	
	var domRowObj = device.domRowObj;
	domRowObj.parentNode.removeChild(domRowObj);			
}

function SyncDeletedDevices() {
	var lstPendingRemovedeviceID = new Array();	
	gDeviceList.EnumItem(
		lstPendingRemovedeviceID, 
		function(lst, key, value) {
			if (!gNewDeviceList.ContainKey(key)) {
				lst.push(key);
			}
		}
	);
	
	var n = lstPendingRemovedeviceID.length;
	for (i = 0; i < n; ++i) {
		RemoveDeviceByID(lstPendingRemovedeviceID[i]);
	}
}

function UpdateList(data) {
	if (null == gDeviceList) {
		gDeviceList = CreateDictionary();
		gDomDeviceList.innerHTML = "";
	}		
	
	gNewDeviceList = CreateDictionary();
	gInterval = data.interval;
	data.devices.forEach(UpdateListItem);
	
	SyncDeletedDevices();
}

function UpdateListItem(device, index) {
	var deviceID = device.hardwareID;
	var deviceName = device.name;
	var currentDev = null;
	var divDevName = null;
	
	gNewDeviceList.AddItem(deviceID, device);
	
	currentDev = gDeviceList.GetItem(deviceID);
	if (currentDev != undefined) {
		divDevName = currentDev.domDevNameObj;
	}
	else {
		gDeviceList.AddItem(deviceID, device);
		
		var divRow = document.createElement("div");	
		divRow.deviceObj = device;
		device.domRowObj = divRow;
		divRow.className = "row";
		
		divRow.RearmUpdateDeviceStateTimer = function() {
			this.deviceObj.updateDeviceStateTimerID = setTimeout(
				function() { BeginUpdateDeviceState(deviceID); },
				this.deviceObj.interval
			);
		};
		
		divDevName = document.createElement("div");
		divDevName.deviceObj = device;
		device.domDevNameObj = divDevName;
		divRow.appendChild(divDevName);
		divDevName.className = "col1";
		
		var divPwrSwitch = document.createElement("div");
		divRow.appendChild(divPwrSwitch);
		divPwrSwitch.className = "col2";
	
		var imgPwrSwitch = document.createElement("img");		
		imgPwrSwitch.deviceObj = device;
		device.domImgPwrSw = imgPwrSwitch;
		
		imgPwrSwitch.className = "power_sw";
		imgPwrSwitch.style.display = "none";
		divPwrSwitch.appendChild(imgPwrSwitch);

		divDevName.DeviceStateChanged = function() {
			var state = this.deviceObj.state;
			var color = "#454545";
			if (state < 0) {
				color = "#ff4555";
			}
			this.style.color = color;
		};
		
		imgPwrSwitch.DeviceStateChanged = function() {
			var state = this.deviceObj.state;
			if (state >= 0) {
				this.style.display = "";
				this.src = "images/switch-" + state + ".png";
			}
			else {
				this.style.display = "none";
			}
		};

		imgPwrSwitch.addEventListener("click", ChangePwrSwitchState);		
		
		gDomDeviceList.appendChild(divRow);		
		divRow.RearmUpdateDeviceStateTimer();
	}
	
	divDevName.innerText = deviceName;		
}

function ChangePwrSwitchState() {
	var device = this.deviceObj;
	device.state = ((device.state + 1) % 2);
	this.DeviceStateChanged();	
	SaveDeviceState(device);
}

RefreshList();
