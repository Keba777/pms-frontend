"use client";

import React, { useState } from "react";
import { useTodoStore } from "@/store/todoStore";

const TodosPage = () => {
  const [text, setText] = useState("");
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();

  const handleAdd = () => {
    if (!text.trim()) return;
    addTodo(text.trim());
    setText("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-cyan-700 mb-4 text-center">
          My Todos
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you need to do?"
            className="flex-1 px-3 py-2 border border-cyan-700 rounded-md focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="bg-cyan-700 text-white px-4 py-2 rounded-md hover:bg-cyan-800"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between bg-gray-100 p-3 rounded-md border border-gray-200"
            >
              <span
                onClick={() => toggleTodo(todo.id)}
                className={`flex-1 cursor-pointer ${
                  todo.done ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ✕
              </button>
            </li>
          ))}
          {todos.length === 0 && (
            <p className="text-center text-gray-400">No todos yet!</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TodosPage;
