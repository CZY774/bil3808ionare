import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, bill_id, member_id, old_value, new_value, actor_email } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get bill and member details for email notification
    const { data: bill } = await supabaseClient
      .from('bills')
      .select(`
        *,
        creator:users!creator_id(full_name, email),
        bill_members(
          *,
          member:users!member_id(full_name, email)
        )
      `)
      .eq('id', bill_id)
      .single()

    if (!bill) {
      throw new Error('Bill not found')
    }

    const affectedMember = bill.bill_members.find((bm: any) => bm.member_id === member_id)
    if (!affectedMember) {
      throw new Error('Member not found in bill')
    }

    // Send email notification to all bill members about the admin action
    const allEmails = [
      bill.creator.email,
      ...bill.bill_members.map((bm: any) => bm.member.email)
    ]

    // Remove duplicates
    const uniqueEmails = [...new Set(allEmails)]

    const actionText = action === 'status_change' 
      ? `Status pembayaran ${affectedMember.member.full_name} diubah dari "${old_value}" menjadi "${new_value}"`
      : `${action} untuk ${affectedMember.member.full_name}`

    const emailData = {
      to: uniqueEmails,
      subject: `[Admin Action] Perubahan pada tagihan "${bill.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🔧 Admin Action - Perubahan Tagihan</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>Admin telah melakukan perubahan pada tagihan ini.</strong>
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e293b;">${bill.title}</h3>
            
            <div style="margin: 15px 0;">
              <strong style="color: #374151;">Aksi yang dilakukan:</strong><br>
              <span style="color: #6b7280;">${actionText}</span>
            </div>

            <div style="margin: 15px 0;">
              <strong style="color: #374151;">Dilakukan oleh:</strong><br>
              <span style="color: #6b7280;">Admin (${actor_email})</span>
            </div>

            <div style="margin: 15px 0;">
              <strong style="color: #374151;">Waktu:</strong><br>
              <span style="color: #6b7280;">${new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              ℹ️ Semua perubahan admin tercatat dalam audit log untuk transparansi.
            </p>
          </div>

          <div style="margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL')}/bills/${bill.id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Lihat Detail Tagihan
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Email notifikasi otomatis dari sistem Bil3808ionaire.<br>
            Semua aksi admin dicatat untuk menjaga transparansi.
          </p>
        </div>
      `
    }

    // Send email notification
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bil3808ionaire Admin <admin@bil3808ionaire.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    })

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Audit log notification sent',
        email_result: emailResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
