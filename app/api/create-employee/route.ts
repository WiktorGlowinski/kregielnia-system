import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json();
  
  // Ważne: Używamy SERVICE_ROLE_KEY
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Aktualizacja tabeli profiles ze zdjęcia
  await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, role: 'employee', updated_at: new Date().toISOString() })
    .eq('id', data.user.id);

  return NextResponse.json({ message: 'Success' });
}