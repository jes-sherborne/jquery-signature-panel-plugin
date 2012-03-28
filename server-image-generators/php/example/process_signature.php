<?php
require_once "signature_panel.php";
$jsonData = file_get_contents('php://input');
$image = generate_signature_panel_image($jsonData);

$filename = "signatures/img-";
for ($i = 0; $i < 8; $i++) {
    $filename .= dechex(mt_rand(0, 65535));
}
$filename .= ".png";

imagepng($image, $filename);
echo "/" . $filename;
?>