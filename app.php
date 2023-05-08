<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Orhanerday\OpenAI\OpenAI;

require 'vendor/autoload.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$app = AppFactory::create();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Enable CORS
$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response;
});

$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// ... (Your endpoints and other code will go here)

// Database connection
$db = new PDO('mysql:host=localhost;dbname=your_database_name', 'your_database_user', 'your_database_password');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Register endpoint
$app->post('/register', function (Request $request, Response $response) use ($db) {
    // ... (Your registration logic goes here)
});

// Login endpoint
$app->post('/login', function (Request $request, Response $response) use ($db) {
    // ... (Your login logic goes here)
});

$app->post('/chat', function (Request $request, Response $response) {
    error_log("Received a request at /chat endpoint");
    $data = $request->getParsedBody();
    $message = $data['message'] ?? '';

    // Replace with your OpenAI API key
    $apiKey = getenv('OPENAI_API_KEY');

    $openai = new OpenAI($apiKey);
    $prompt = "User: {$message}\nAssistant:";

    $options = [
        'engine' => 'text-davinci-002',
        'prompt' => $prompt,
        'max_tokens' => 150,
        'temperature' => 0.8,
        'top_p' => 1,
        'stop' => ['\n'],
    ];

    try {
        $result = $openai->complete($options);
        $generated_text = $result['choices'][0]['text'];
    } catch (Exception $e) {
        $generated_text = 'Error: ' . $e->getMessage();
    }

    $response->getBody()->write(json_encode(['response' => $generated_text]));
    return $response->withHeader('Content-Type', 'application/json');
});

// ... (Other endpoints)

$app->run();     