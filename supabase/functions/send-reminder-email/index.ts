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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get bills with upcoming deadlines (24 hours before)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: bills, error: billsError } = await supabaseClient
      .from('bills')
      .select(`
        *,
        creator:users!creator_id(full_name, email),
        bill_members(
          *,
          member:users!member_id(full_name, email)
        )
      `)
      .eq('deadline', tomorrowStr)

    if (billsError) {
      throw billsError
    }

    const emailPromises = []

    for (const bill of bills || []) {
      // Send reminder to unpaid members
      const unpaidMembers = bill.bill_members.filter((bm: any) => bm.status === 'belum')
      
      for (const billMember of unpaidMembers) {
        const emailData = {
          to: [billMember.member.email],
          subject: `Reminder: Tagihan "${bill.title}" - Deadline Besok!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">🔔 Reminder Tagihan</h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${bill.title}</h3>
                <p style="margin: 5px 0; color: #64748b;">
                  <strong>Jumlah:</strong> Rp ${bill.per_person.toLocaleString('id-ID')}
                </p>
                <p style="margin: 5px 0; color: #64748b;">
                  <strong>Deadline:</strong> ${new Date(bill.deadline).toLocaleDateString('id-ID')} (Besok!)
                </p>
                ${bill.description ? `<p style="margin: 5px 0; color: #64748b;"><strong>Keterangan:</strong> ${bill.description}</p>` : ''}
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  ⚠️ <strong>Deadline besok!</strong> Jangan lupa upload bukti pembayaran ya.
                </p>
              </div>

              <div style="margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL')}/bills/${bill.id}" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Lihat Tagihan & Upload Bukti
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Email ini dikirim otomatis oleh sistem Bil3808ionaire.<br>
                Dibuat oleh: ${bill.creator.full_name}
              </p>
            </div>
          `
        }

        // Use Resend API or Supabase's built-in email (if available)
        const emailPromise = fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bil3808ionaire <noreply@bil3808ionaire.com>',
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
          }),
        })

        emailPromises.push(emailPromise)
      }

      // Also send summary to bill creator
      if (unpaidMembers.length > 0) {
        const creatorEmailData = {
          to: [bill.creator.email],
          subject: `Status Tagihan "${bill.title}" - ${unpaidMembers.length} belum bayar`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">📊 Status Tagihan</h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${bill.title}</h3>
                <p style="margin: 5px 0; color: #64748b;">
                  <strong>Deadline:</strong> ${new Date(bill.deadline).toLocaleDateString('id-ID')} (Besok!)
                </p>
                <p style="margin: 5px 0; color: #64748b;">
                  <strong>Total Anggota:</strong> ${bill.bill_members.length}
                </p>
                <p style="margin: 5px 0; color: #64748b;">
                  <strong>Sudah Bayar:</strong> ${bill.bill_members.length - unpaidMembers.length}
                </p>
                <p style="margin: 5px 0; color: #dc2626;">
                  <strong>Belum Bayar:</strong> ${unpaidMembers.length}
                </p>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">Yang Belum Bayar:</h4>
                <ul style="margin: 0; color: #92400e;">
                  ${unpaidMembers.map((bm: any) => `<li>${bm.member.full_name}</li>`).join('')}
                </ul>
              </div>

              <div style="margin: 30px 0;">
                <a href="${Deno.env.get('SITE_URL')}/bills/${bill.id}" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Lihat Detail Tagihan
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Email reminder otomatis dari sistem Bil3808ionaire.
              </p>
            </div>
          `
        }

        const creatorEmailPromise = fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bil3808ionaire <noreply@bil3808ionaire.com>',
            to: creatorEmailData.to,
            subject: creatorEmailData.subject,
            html: creatorEmailData.html,
          }),
        })

        emailPromises.push(creatorEmailPromise)
      }
    }

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reminder emails processed: ${successful} sent, ${failed} failed`,
        bills_processed: bills?.length || 0
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
