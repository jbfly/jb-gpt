<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../vendor/autoload.php';

use OpenAI\OpenAI;

$apiKey = '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';
OpenAI::setApiKey($apiKey);

$engine = 'davinci-codex';
$prompt = 'What is the capital of France?';

$response = OpenAI::api('engines/' . $engine . '/completions')->create([
    'engine' => $engine,
    'prompt' => $prompt,
    'max_tokens' => 5,
]);

header('Content-Type: application/json');
echo json_encode($response->data);
