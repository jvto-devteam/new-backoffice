<?php

namespace App\Console\Commands;

use Google\Client;
use Illuminate\Console\Command;

class GmailSetup extends Command
{
    protected $signature = 'gmail:setup';
    protected $description = 'One-time OAuth2 setup to authorize Gmail API access for javavolcano.rendezvous@gmail.com';

    public function handle(): int
    {
        $clientId     = config('services.gmail.client_id');
        $clientSecret = config('services.gmail.client_secret');

        if (!$clientId || !$clientSecret) {
            $this->error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env first.');
            return self::FAILURE;
        }

        $client = new Client();
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('http://127.0.0.1:9999');
        $client->setScopes(['https://www.googleapis.com/auth/gmail.readonly']);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $authUrl = $client->createAuthUrl();

        $this->info('Open this URL in your browser:');
        $this->line('');
        $this->line($authUrl);
        $this->line('');
        $this->info('Sign in as javavolcano.rendezvous@gmail.com and grant access.');
        $this->info('After redirect, copy the "code" value from the URL bar.');
        $this->info('The redirect URL looks like: http://127.0.0.1:9999/?code=4%2FXXXXX...');
        $this->line('');

        $authCode = $this->ask('Paste the authorization code here');

        if (!$authCode) {
            $this->error('No code provided.');
            return self::FAILURE;
        }

        $token = $client->fetchAccessTokenWithAuthCode($authCode);

        if (isset($token['error'])) {
            $this->error('OAuth error: ' . ($token['error_description'] ?? $token['error']));
            return self::FAILURE;
        }

        if (!isset($token['refresh_token'])) {
            $this->error('No refresh_token returned. If you already authorized this app, revoke access at https://myaccount.google.com/permissions and run this command again.');
            return self::FAILURE;
        }

        $refreshToken = $token['refresh_token'];
        $this->writeToEnv('GMAIL_REFRESH_TOKEN', $refreshToken);

        $this->info('GMAIL_REFRESH_TOKEN saved to .env successfully!');
        $this->info('You can now run: php artisan bca:sync-transfers');

        return self::SUCCESS;
    }

    private function writeToEnv(string $key, string $value): void
    {
        $envPath    = base_path('.env');
        $envContent = file_get_contents($envPath);

        if (str_contains($envContent, $key . '=')) {
            $envContent = preg_replace_callback('/^' . $key . '=.*/m', fn() => $key . '=' . $value, $envContent);
        } else {
            $envContent .= PHP_EOL . $key . '=' . $value . PHP_EOL;
        }

        file_put_contents($envPath, $envContent);
    }
}
