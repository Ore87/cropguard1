import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  to: string;
  message: string;
  alertType: 'sms' | 'call';
  pestType?: string;
  infestationLevel?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, alertType, pestType, infestationLevel }: AlertRequest = await req.json();

    console.log(`Sending ${alertType} alert to ${to}`);

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;

    if (alertType === 'sms') {
      // Send SMS
      const smsBody = new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      });

      const smsResponse = await fetch(`${twilioUrl}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: smsBody.toString(),
      });

      const smsData = await smsResponse.json();
      
      if (!smsResponse.ok) {
        console.error('SMS send failed:', smsData);
        throw new Error(`SMS failed: ${smsData.message || 'Unknown error'}`);
      }

      console.log('SMS sent successfully:', smsData.sid);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'sms',
          sid: smsData.sid,
          status: smsData.status 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Make phone call with TwiML
      const twimlMessage = `
        <Response>
          <Say voice="alice">
            Critical Alert from KwaVest AI. 
            ${pestType ? `${pestType} detected with ${infestationLevel} infestation level.` : ''}
            ${message}
            Please check your dashboard immediately for details.
          </Say>
          <Pause length="2"/>
          <Say voice="alice">This message will repeat.</Say>
          <Pause length="1"/>
          <Say voice="alice">
            ${pestType ? `${pestType} detected with ${infestationLevel} infestation level.` : ''}
            ${message}
          </Say>
        </Response>
      `;

      const callBody = new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Twiml: twimlMessage,
      });

      const callResponse = await fetch(`${twilioUrl}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: callBody.toString(),
      });

      const callData = await callResponse.json();
      
      if (!callResponse.ok) {
        console.error('Call initiation failed:', callData);
        throw new Error(`Call failed: ${callData.message || 'Unknown error'}`);
      }

      console.log('Call initiated successfully:', callData.sid);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'call',
          sid: callData.sid,
          status: callData.status 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error in send-twilio-alert function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
