<?php

namespace Tests\Feature;

use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\SessionManager;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_is_public_stateless_xml_for_visitors_and_googlebot(): void
    {
        Storage::fake('public');
        $this->seed(PortfolioContentSeeder::class);
        $this->mock(SessionManager::class)->shouldNotReceive('driver');

        foreach (['Mozilla/5.0', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'] as $agent) {
            $response = $this->withHeader('User-Agent', $agent)->get('https://portfolio.test/sitemap.xml');
            $response->assertOk()
                ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertHeaderMissing('Location')
                ->assertHeaderMissing('Set-Cookie')
                ->assertHeaderMissing('X-Robots-Tag')
                ->assertHeaderMissing('Vary')
                ->assertSee('<urlset', false)
                ->assertDontSee('<html', false);

            $xml = simplexml_load_string($response->getContent());
            $this->assertNotFalse($xml);
            $this->assertSame('urlset', $xml->getName());
            $this->assertSame('http://www.sitemaps.org/schemas/sitemap/0.9', $xml->getDocNamespaces()['']);
            $locations = [];
            foreach ($xml->url as $entry) {
                $url = (string) $entry->loc;
                $locations[] = $url;
                $this->assertSame('https', parse_url($url, PHP_URL_SCHEME));
                $this->assertSame('portfolio.test', parse_url($url, PHP_URL_HOST));
                $this->assertDoesNotMatchRegularExpression('~/(admin|login|logout|register|forgot-password|reset-password)(/|$)~', $url);
                if (isset($entry->lastmod)) {
                    $date = (string) $entry->lastmod;
                    $parsed = \DateTimeImmutable::createFromFormat(DATE_ATOM, $date);
                    $this->assertNotFalse($parsed);
                    $this->assertSame($date, $parsed->format(DATE_ATOM));
                }
            }
            foreach (['', '/en', '/projets', '/en/projects', '/a-propos', '/en/about', '/activites', '/en/activities', '/publications', '/en/publications', '/contact', '/en/contact', '/projets/libiki-lya-kongo', '/en/projects/libiki-lya-kongo'] as $path) {
                $this->assertContains('https://portfolio.test'.$path, $locations);
            }
        }
    }
}
