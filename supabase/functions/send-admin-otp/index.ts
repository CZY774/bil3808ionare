import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { email } = await req.json();

		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		);

		// Send OTP using Supabase Auth (proper way from docs)
		const { data, error } = await supabaseClient.auth.admin.generateLink({
			type: 'magiclink',
			email: email,
			options: {
				redirectTo: `${Deno.env.get('SITE_URL')}/admin?mode=verify`
			}
		});

		if (error) throw error;

		// Extract OTP from the magic link (last 6 digits of the token)
		const token = data.properties?.hashed_token || '';
		const otp = token.slice(-6).toUpperCase();

		// Send email with OTP
		const emailResponse = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: 'Bil3808ionaire Admin <admin@bil3808ionaire.com>',
				to: [email],
				subject: 'Admin OTP - Bil3808ionaire',
				html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; text-align: center;">
            <h2 style="color: #dc2626;">🔐 Admin Access</h2>
            <p>Kode OTP untuk akses admin:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #1f2937;">${otp}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Kode berlaku 5 menit</p>
          </div>
        `
			})
		});

		// Store OTP temporarily (5 minutes)
		await supabaseClient.from('admin_otps').insert({
			email,
			otp_code: otp,
			expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
		});

		return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400
		});
	}
});
