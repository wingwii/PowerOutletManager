<?php
	header('Content-Type: application/json');
	
	$method = strtoupper($_SERVER["REQUEST_METHOD"]);
	if (0 != strcmp($method, "GET")) {
		return;
	}
	
	require_once "deviceinfo.php";
	
	$workingPath = __DIR__ . "/";
	$json = file_get_contents($workingPath . "config/devices.json");
	$devCfg = json_decode($json);
	
	$result = (object)[
		"interval" => $devCfg->interval,
		"devices" => []
	];
		
	$idx = 0;
	foreach ($devCfg->devices as $device) {
		$item = (object)[
			"hardwareID" => EncryptDeviceInfo($device->info),
			"interval" => $device->interval,
			"name" => $device->name,
			"state" => -1
		];		
		array_push($result->devices, $item);
		++$idx;
	}
		
	$json = json_encode($result);
	echo $json;
?>
