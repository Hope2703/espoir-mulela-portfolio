<?php

namespace Tests\Feature;

use App\Mail\ContactMessageConfirmation;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ResetPassword;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CorrectionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false, 'portfolio.admin_email' => 'admin@example.test', 'portfolio.send_confirmation' => false]);
    }

    private function administrator(): User
    {
        $user = User::factory()->create();
        $user->is_admin = true;
        $user->save();

        return $user;
    }

    public function test_login_errors_are_human_and_translated(): void
    {
        $this->from('/login')->post('/login', [])->assertSessionHasErrors(['email' => 'L’adresse email est obligatoire.', 'password' => 'Le mot de passe est obligatoire.']);
        $this->post('/login', ['email' => 'invalid', 'password' => Str::password(20)])->assertSessionHasErrors(['email' => 'Veuillez saisir une adresse email valide.']);
        $this->post('/login', ['email' => 'unknown@example.test', 'password' => Str::password(20)])->assertSessionHasErrors(['email' => 'Les identifiants fournis sont incorrects.']);
        $this->withSession(['locale' => 'en'])->post('/login', ['email' => 'unknown@example.test', 'password' => Str::password(20)])->assertSessionHasErrors(['email' => 'The credentials provided are incorrect.']);
    }

    public function test_login_intended_url_and_logout(): void
    {
        $password = Str::password(20);
        $user = $this->administrator();
        $user->update(['password' => $password]);
        $this->get('/admin/projects')->assertRedirect('/login');
        $this->post('/login', ['email' => $user->email, 'password' => $password])->assertRedirect('/admin/projects');
        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_session_language_changes_without_changing_auth_or_admin_urls(): void
    {
        $this->seed(PortfolioContentSeeder::class);
        $this->from('/login')->post('/locale', ['locale' => 'en'])->assertRedirect('/login')->assertSessionHas('locale', 'en');
        $this->get('/login')->assertInertia(fn (Assert $p) => $p->where('locale', 'en')->where('authCopy.login', 'Sign in'));
        $this->actingAs($this->administrator());
        $this->from('/admin/projects')->post('/locale', ['locale' => 'fr'])->assertRedirect('/admin/projects');
        $this->get('/admin/projects')->assertInertia(fn (Assert $p) => $p->where('locale', 'fr')->where('adminCopy.Projets', 'Projets'));
        $this->from('/admin/projects')->post('/locale', ['locale' => 'en'])->assertRedirect('/admin/projects');
        $this->get('/admin/projects')->assertInertia(fn (Assert $p) => $p->where('locale', 'en')->where('adminCopy.Projets', 'Projects'));
        $this->get('/')->assertInertia(fn (Assert $p) => $p->where('locale', 'fr'));
        $this->get('/en')->assertInertia(fn (Assert $p) => $p->where('locale', 'en'));
        $this->get('/admin/projects')->assertInertia(fn (Assert $p) => $p->where('locale', 'en'));
        $this->post('/logout')->assertRedirect('/')->assertSessionHas('locale', 'en');
        $this->assertGuest();
        $this->get('/login')->assertInertia(fn (Assert $p) => $p->where('locale', 'en'));
        $this->post('/locale', ['locale' => 'unknown'])->assertSessionHasErrors('locale');
        $this->get('/en/login')->assertNotFound();
        $this->get('/fr/admin')->assertNotFound();
    }

    public function test_login_throttling_is_retained(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['email' => 'throttle@example.test', 'password' => Str::password(20)])->assertSessionHasErrors('email');
        }
        $this->post('/login', ['email' => 'throttle@example.test', 'password' => Str::password(20)])->assertRedirect()->assertSessionHasErrors('email');
        $this->postJson('/login', ['email' => 'throttle@example.test', 'password' => Str::password(20)])->assertStatus(429)->assertJsonPath('errors.email.0', fn ($message) => str_contains($message, 'tentatives'));
    }

    public function test_admin_bootstrap_hashes_password_and_preserves_existing_account(): void
    {
        $password = Str::password(20);
        config(['portfolio.admin_email' => 'bootstrap@example.test', 'portfolio.admin_password' => $password]);
        $this->seed(AdminUserSeeder::class);
        $user = User::where('email', 'bootstrap@example.test')->firstOrFail();
        $this->assertTrue($user->is_admin);
        $this->assertNotSame($password, $user->password);
        $this->assertTrue(Hash::check($password, $user->password));
        config(['portfolio.admin_password' => Str::password(20)]);
        $this->seed(AdminUserSeeder::class);
        $this->assertTrue(Hash::check($password, $user->fresh()->password));
        $this->assertDatabaseCount('users', 1);
    }

    public function test_admin_bootstrap_requires_explicit_configuration(): void
    {
        config(['portfolio.admin_email' => '', 'portfolio.admin_password' => '']);
        $this->expectException(\RuntimeException::class);
        $this->seed(AdminUserSeeder::class);
    }

    public function test_profile_requires_current_password_for_sensitive_changes(): void
    {
        $password = Str::password(20);
        $newPassword = Str::password(20);
        $user = $this->administrator();
        $user->update(['password' => $password]);
        $this->actingAs($user)->get('/admin/profile')->assertOk();
        $data = ['name' => 'Updated name', 'email' => 'changed@example.test', 'current_password' => 'wrong', 'password' => $newPassword, 'password_confirmation' => $newPassword];
        $this->put('/admin/profile', $data)->assertSessionHasErrors('current_password');
        $this->assertNotSame('changed@example.test', $user->fresh()->email);
        $data['current_password'] = $password;
        $this->put('/admin/profile', $data)->assertSessionHasNoErrors()->assertSessionHas('success');
        $this->assertSame('changed@example.test', $user->fresh()->email);
        $this->assertTrue(Hash::check($newPassword, $user->fresh()->password));
        $this->assertTrue($user->fresh()->is_admin);
    }

    public function test_forgot_password_does_not_reveal_account_existence(): void
    {
        Notification::fake();
        $user = $this->administrator();
        $this->post('/forgot-password', ['email' => $user->email])->assertSessionHasNoErrors()->assertSessionHas('status', __('passwords.sent'));
        Notification::assertSentTo($user, ResetPassword::class);
        $this->post('/forgot-password', ['email' => 'absent@example.test'])->assertSessionHasNoErrors()->assertSessionHas('status', __('passwords.sent'));
        $this->post('/forgot-password', ['email' => $user->email])->assertSessionHasNoErrors()->assertSessionHas('status', __('passwords.sent'));
    }

    public function test_contact_confirmation_is_optional_and_rendered_with_shared_branding(): void
    {
        Mail::fake();
        config(['portfolio.send_confirmation' => true]);
        $this->post('/contact', ['name' => 'Visiteur test', 'email' => 'visitor@example.test', 'subject' => 'Projet de test', 'message' => 'Un message de test suffisamment détaillé.', 'website' => ''])->assertSessionHasNoErrors();
        Mail::assertSent(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('admin@example.test'));
        Mail::assertSent(ContactMessageConfirmation::class, fn ($mail) => $mail->hasTo('visitor@example.test'));
        $message = ContactMessage::firstOrFail();
        $message->update(['message' => '<script>secret</script> Texte']);
        $html = (new ContactMessageReceived($message))->render();
        $this->assertStringContainsString('role="presentation"', $html);
        $this->assertStringContainsString('Espoir Mulela', $html);
        $this->assertStringContainsString('Voir dans le dashboard', $html);
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringContainsString('Merci de m’avoir contacté', (new ContactMessageConfirmation($message))->render());
        Mail::fake();
        config(['portfolio.send_confirmation' => false]);
        $this->post('/contact', ['name' => 'Visiteur test', 'email' => 'visitor@example.test', 'subject' => 'Autre test', 'message' => 'Un message de test suffisamment détaillé.']);
        Mail::assertNotSent(ContactMessageConfirmation::class);
    }

    public function test_password_reset_mail_uses_branded_layout(): void
    {
        $user = User::factory()->make();
        $html = (new ResetPassword('test-token'))->toMail($user)->render();
        $this->assertStringContainsString('Espoir Mulela', $html);
        $this->assertStringContainsString('Réinitialiser mon mot de passe', $html);
        $this->assertStringContainsString('/reset-password/test-token', $html);
        $this->assertStringContainsString('role="presentation"', $html);
    }

    public function test_password_reset_token_changes_the_password_and_is_single_use(): void
    {
        Notification::fake();
        $user = $this->administrator();
        $token = null;
        $this->withSession(['locale' => 'en'])->post('/forgot-password', ['email' => $user->email])->assertSessionHasNoErrors();
        Notification::assertSentTo($user, ResetPassword::class, function ($notice) use (&$token) {
            $token = $notice->token;

            return true;
        });
        $this->get('/reset-password/'.$token.'?email='.urlencode($user->email))->assertOk();
        $password = Str::password(20);
        $payload = ['email' => $user->email, 'token' => $token, 'password' => $password, 'password_confirmation' => $password];
        $this->post('/reset-password', $payload)->assertRedirect('/login')->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check($password, $user->fresh()->password));
        $this->post('/reset-password', $payload)->assertSessionHasErrors('email');
        $this->post('/login', ['email' => $user->email, 'password' => $password])->assertRedirect('/admin');
        $this->assertAuthenticatedAs($user);
    }

    public function test_the_agency_is_published_bilingual_editable_and_idempotent(): void
    {
        $this->seed(PortfolioContentSeeder::class);
        $project = Project::where('content_key', 'the-agency-drc')->firstOrFail();
        $this->assertSame('published', $project->status);
        $this->assertSame(2, $project->media()->count());
        $this->get('/projets/the-agency-drc')->assertInertia(fn (Assert $p) => $p->where('project.title.fr', 'THE AGENCY DRC')->where('meta.switchUrl', '/en/projects/the-agency-drc'));
        $this->get('/en/projects/the-agency-drc')->assertInertia(fn (Assert $p) => $p->where('locale', 'en')->where('meta.switchUrl', '/projets/the-agency-drc'));
        $this->actingAs($this->administrator())->get('/admin/projects/'.$project->id.'/edit')->assertOk();
        $this->seed(PortfolioContentSeeder::class);
        $this->assertSame(1, Project::where('content_key', 'the-agency-drc')->count());
    }
}
