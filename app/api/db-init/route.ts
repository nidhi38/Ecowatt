import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ 
        success: false, 
        error: 'Missing Supabase credentials' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if tables already exist by trying to query them
    const { data: usersData } = await supabase.from('users').select('count').limit(1);
    
    if (usersData) {
      return Response.json({ 
        success: true, 
        message: 'Database tables already exist' 
      });
    }

    // Tables will be created via Supabase migrations
    // For now, we'll just verify the connection works
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error && error.status !== 404) {
      console.error('Connection error:', error);
      return Response.json({ 
        success: false, 
        error: 'Database connection failed'
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Database connection verified' 
    });
  } catch (error) {
    console.error('Database init error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
