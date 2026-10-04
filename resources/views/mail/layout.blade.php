<!doctype html><html lang="{{ app()->getLocale() }}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>@yield('title', 'Espoir Mulela')</title></head>
<body style="margin:0;padding:0;background-color:#f3f5ef;color:#192c28;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f5ef"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff">
<tr><td style="padding:28px 28px;background-color:#192c28;color:#edf2e9;font-size:22px;font-weight:bold">Espoir Mulela<span style="color:#bde486">.</span></td></tr>
<tr><td style="padding:30px 28px;font-size:16px;line-height:1.7;word-break:break-word">@yield('body')</td></tr>
<tr><td style="border-top:1px solid #dce2d8;padding:22px 28px;font-size:13px;line-height:1.6;color:#536258">Espoir Mulela<br>{{ __('mail.footer') }}</td></tr>
</table></td></tr></table></body></html>