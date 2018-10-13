<?php
	$gCipherName = "AES-192-CFB";
	$gCryptoIV = "Your AES-192 IV";
	$gCryptoKey = "Your AES-192 KEY";
	
	
	function PrepareCryptoIV() {
		global $gCipherName;
		global $gCryptoIV;
		
		$ivLen = openssl_cipher_iv_length($gCipherName);
		return substr($gCryptoIV, 0, $ivLen);
	}

	function EncryptDeviceInfo($deviceInfo) {
		global $gCipherName;
		global $gCryptoKey;
		
		$iv = PrepareCryptoIV();		
		$cipherText = openssl_encrypt($deviceInfo, $gCipherName, $gCryptoKey, 0, $iv);
		
		$hardwareID = strtoupper(bin2hex(base64_decode($cipherText)));
		return $hardwareID;
		
	}

	function DecryptDeviceInfo($hardwareID) {
		global $gCipherName;
		global $gCryptoKey;
		
		$cipherText = base64_encode(hex2bin(strtolower($hardwareID)));
		
		$iv = PrepareCryptoIV();		
		$deviceInfo = openssl_decrypt($cipherText, $gCipherName, $gCryptoKey, 0, $iv);
		
		return $deviceInfo;
		
	}

?>