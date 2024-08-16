'use client'
import { useState, useEffect } from 'react';
import { Tables } from '../utils/types/supabase'; // Adjust the path

type Todo = Tables<'todos'>;

export default function PrivatePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');

  // Fetch todos
  useEffect(() => {
	const fetchTodos = async () => {
  	const response = await fetch('/api/todos', {
    	method: 'GET',
  	});
  	const data = await response.json();
  	if (!response.ok) {
    	console.error('Failed to fetch todos:', data.error);
    	return;
  	}
  	setTodos(data);
	};
	fetchTodos();
  }, []);

  // Add a new todo
  const addTodo = async () => {
	const response = await fetch('/api/todos', {
  	method: 'POST',
  	headers: {
    	'Content-Type': 'application/json',
  	},
  	body: JSON.stringify({ title: newTodo }),
	});
	if (!response.ok) {
  	const errorData = await response.json();
  	console.error('Failed to add todo:', errorData.error);
  	return;
	}

	const data: Todo = await response.json();
	setTodos([data, ...todos]);
	setNewTodo('');
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
	const response = await fetch('/api/todos', {
  	method: 'DELETE',
  	headers: {
    	'Content-Type': 'application/json',
  	},
  	body: JSON.stringify({ id }),
	});
	if (!response.ok) {
  	const errorData = await response.json();
  	console.error('Failed to delete todo:', errorData.error);
  	return;
	}
	setTodos(todos.filter(todo => todo.id !== id));
  };

  // Toggle completion
  const toggleComplete = async (id: string, is_complete: boolean) => {
	const response = await fetch('/api/todos', {
  	method: 'PUT',
  	headers: {
    	'Content-Type': 'application/json',
  	},
  	body: JSON.stringify({ id, is_complete }),
	});
	if (!response.ok) {
  	const errorData = await response.json();
  	console.error('Failed to update todo:', errorData.error);
  	return;
	}

	const updatedTodo: Todo = await response.json();
	setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
  };

  return (
	<div>
  	<h1>Your Todos</h1>
  	<input
    	type="text"
    	value={newTodo}
    	onChange={(e) => setNewTodo(e.target.value)}
    	placeholder="New todo"
  	/>
  	<button onClick={addTodo}>Add Todo</button>
  	<ul>
    	{todos.map(todo => (
      	<li key={todo.id}>
        	<span
          	style={{ textDecoration: todo.is_complete ? 'line-through' : 'none' }}
          	onClick={() => toggleComplete(todo.id, !todo.is_complete)}
        	>
          	{todo.title}
        	</span>
        	<button onClick={() => deleteTodo(todo.id)}>Delete</button>
      	</li>
    	))}
  	</ul>
	</div>
  );
}
