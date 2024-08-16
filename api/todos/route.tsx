import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../app/utils/supabase/server';
import { Tables, TablesInsert, TablesUpdate } from '../../app/utils/supabase/server';

type Todo = Tables<'todos'>;
type TodoInsert = TablesInsert<'todos'>;
type TodoUpdate = TablesUpdate<'todos'>;

// GET /api/todos - Fetch all todos for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Fetch the authenticated user
  const {
	data: { user },
	error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
	return NextResponse.json({ error: userError?.message || 'User not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
	.from('todos')
	.select('*')
	.eq('user_id', user.id)
	.order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (!data || data.length === 0) return NextResponse.json({ error: 'No todos found' }, { status: 404 });

  return NextResponse.json(data as Todo[]);
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { title }: TodoInsert = body;

  // Fetch the authenticated user
  const {
	data: { user },
	error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
	return NextResponse.json({ error: userError?.message || 'User not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
	.from('todos')
	.insert([{ title, user_id: user.id }])
	.select();  // Ensure we select and return the inserted rows

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (!data || data.length === 0) return NextResponse.json({ error: 'Todo creation failed' }, { status: 500 });

  return NextResponse.json(data[0] as Todo);
}

// PUT /api/todos - Update an existing todo
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { id, is_complete }: TodoUpdate = body;

  // Fetch the authenticated user
  const {
	data: { user },
	error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
	return NextResponse.json({ error: userError?.message || 'User not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
	.from('todos')
	.update({ is_complete })
	.eq('id', id)
	.eq('user_id', user.id)
	.select();  // Ensure we select and return the updated rows

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (!data || data.length === 0) return NextResponse.json({ error: 'Todo update failed' }, { status: 500 });

  return NextResponse.json(data[0] as Todo);
}

// DELETE /api/todos - Delete a todo
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { id }: { id: string } = body;

  // Fetch the authenticated user
  const {
	data: { user },
	error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
	return NextResponse.json({ error: userError?.message || 'User not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
	.from('todos')
	.delete()
	.eq('id', id)
	.eq('user_id', user.id)
	.select();  // Ensure we select and return the deleted rows

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (!data || data.length === 0) return NextResponse.json({ error: 'Todo deletion failed' }, { status: 500 });

  return NextResponse.json(data as Todo[]);
}