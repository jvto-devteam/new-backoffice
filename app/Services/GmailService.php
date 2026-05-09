<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Illuminate\Support\Facades\Log;

class GmailService
{
    private Gmail $gmail;

    public function __construct()
    {
        $client = new Client();
        $client->setClientId(config('services.gmail.client_id'));
        $client->setClientSecret(config('services.gmail.client_secret'));
        $client->setScopes(['https://www.googleapis.com/auth/gmail.readonly']);
        $client->setAccessType('offline');

        $newToken = $client->fetchAccessTokenWithRefreshToken(config('services.gmail.refresh_token'));

        if (isset($newToken['error'])) {
            throw new \RuntimeException(
                'Gmail token refresh failed: ' . ($newToken['error_description'] ?? $newToken['error'])
                . ' — run: php artisan gmail:setup'
            );
        }

        $this->gmail = new Gmail($client);
    }

    /**
     * Fetch emails from klikbcabisnis@klikbca.com sent in the last 14 days.
     * Returns array of ['message_id', 'body', 'received_at'].
     */
    public function fetchBcaEmails(int $maxResults = 100): array
    {
        $response = $this->gmail->users_messages->listUsersMessages('me', [
            'q'          => 'from:klikbcabisnis@klikbca.com newer_than:14d',
            'maxResults' => $maxResults,
        ]);

        $messages = $response->getMessages();
        if (!$messages) {
            return [];
        }

        $emails = [];
        foreach ($messages as $message) {
            try {
                $full = $this->gmail->users_messages->get('me', $message->getId(), [
                    'format' => 'full',
                ]);

                $body       = $this->extractBody($full);
                $receivedAt = date('Y-m-d H:i:s', intdiv((int) $full->getInternalDate(), 1000));

                $emails[] = [
                    'message_id'  => $message->getId(),
                    'body'        => $body,
                    'received_at' => $receivedAt,
                ];
            } catch (\Exception $e) {
                Log::warning('GmailService: failed to fetch message ' . $message->getId(), [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $emails;
    }

    private function extractBody(Gmail\Message $message): string
    {
        $payload = $message->getPayload();
        return $this->findPlainText($payload)
            ?? $this->stripHtml($this->findHtml($payload) ?? '')
            ?? '';
    }

    private function findPlainText(Gmail\MessagePart $part): ?string
    {
        if ($part->getMimeType() === 'text/plain' && $part->getBody()?->getData()) {
            return base64_decode(strtr($part->getBody()->getData(), '-_', '+/'));
        }
        foreach ($part->getParts() ?? [] as $subPart) {
            $result = $this->findPlainText($subPart);
            if ($result !== null) {
                return $result;
            }
        }
        return null;
    }

    private function findHtml(Gmail\MessagePart $part): ?string
    {
        if ($part->getMimeType() === 'text/html' && $part->getBody()?->getData()) {
            return base64_decode(strtr($part->getBody()->getData(), '-_', '+/'));
        }
        foreach ($part->getParts() ?? [] as $subPart) {
            $result = $this->findHtml($subPart);
            if ($result !== null) {
                return $result;
            }
        }
        return null;
    }

    private function stripHtml(string $html): string
    {
        return html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');
    }
}
