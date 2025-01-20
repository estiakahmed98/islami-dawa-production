import DayiLeaveEmail from '@/emails/DayiLeaveEmail';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(request: Request){
    const {email,name,leaveType, reason,leaveDates} = await request.json();
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Leave Application',
        react: DayiLeaveEmail({name, leaveType, reason , leaveDates}),
      });
}