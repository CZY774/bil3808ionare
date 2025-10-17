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
		const { email, otp } = await req.json();

		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		);

		// Verify OTP
		const { data: otpRecord, error } = await supabaseClient
			.from('admin_otps')
			.select('*')
			.eq('email', email)
			.eq('otp_code', otp.toUpperCase())
			.gt('expires_at', new Date().toISOString())
			.single();

		if (error || !otpRecord) {
			return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OTP' }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 400
			});
		}

		// Delete used OTP
		await supabaseClient.from('admin_otps').delete().eq('id', otpRecord.id);

		return new Response(JSON.stringify({ success: true, message: 'OTP verified' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400
		});
	}
});
