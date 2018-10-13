<?php
	header('Content-Type: application/json');
	
	require_once "deviceinfo.php";
	
	function PrepareDevCtlCmd($deviceInfo) {
		$workingPath = __DIR__ . "/";	
		$cmd = "python \"" . $workingPath . "cli/broadlink_cli\" --device \"" . $deviceInfo . "\"";
		return $cmd;
	}
	
	function GetDeviceStatus($deviceInfo) {
		$cmd = PrepareDevCtlCmd($deviceInfo) . " --check";			
		
		$cmdResult = shell_exec($cmd);
		$cmdResult = str_replace("*", "", $cmdResult);
		$cmdResult = strtoupper(trim($cmdResult));
		
		$pwrState = -1;
		if (0 == strcmp($cmdResult, "ON")) {
			$pwrState = 1;
		}
		else if (0 == strcmp($cmdResult, "OFF")) {
			$pwrState = 0;
		}		
		return $pwrState;
	}
	
	$method = strtoupper($_SERVER["REQUEST_METHOD"]);
	if (0 == strcmp($method, "GET")) {
		$deviceInfo = "";
		$requestName = "hardwareID";
		if (isset($_GET[$requestName])) {
			$deviceInfo = $_GET[$requestName];
		}
		$deviceInfo = DecryptDeviceInfo($deviceInfo);
		$deviceStatus = GetDeviceStatus($deviceInfo);		
		$json = json_encode($deviceStatus);
		echo $json;
	}
	else if (0 == strcmp($method, "POST")) {
		$data = file_get_contents("php://input");
		$data = json_decode($data);
		
		$deviceInfo = DecryptDeviceInfo($data->hardwareID);
		$state = $data->state;

		$cmd = PrepareDevCtlCmd($deviceInfo) . " --turn";
		if (0 == $state) {
			$cmd .= "off";
		}
		else {
			$cmd .= "on";
		}
		shell_exec($cmd);	
		echo json_encode(0);
	}
	
?>
