"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  description?: string;
  deadline?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTag, setNewTag] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState<string>("");

  const colors = [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#B3D1FF", "#D3BAFF",
    "#FFC8E1", "#C8FFD4", "#FFE4B3", "#B3FFE0", "#FFEBCD", "#D9BAFF", "#FFD1BA",
    "#FFBAB3", "#B3FFBA", "#B3E5FF", "#FFC1C8", "#D1FFC1", "#FFD7BA",
  ];
  const [tagsColors, setTagsColors] = useState<{ [key: string]: string }>(() => {
    const savedColors = localStorage.getItem("tagsColors");
    return savedColors ? JSON.parse(savedColors) : {};
  });

  const priorityColors: { [key in "low" | "medium" | "high"]: string } = {
    low: "bg-green-500 text-white",
    medium: "bg-yellow-400 text-white",
    high: "bg-red-600 text-white",
  };

  const today = new Date().toISOString().split("T")[0];

  const getRandomColor = () => {
    const usedColors = Object.values(tagsColors);
    const availableColors = colors.filter((color) => !usedColors.includes(color));
    return availableColors.length > 0
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : colors[Math.floor(Math.random() * colors.length)];
  };

  const sortTodosByDeadline = (tasks: Todo[]) => {
    return [...tasks].sort((a, b) => {
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (a.deadline) {
        return -1;
      } else if (b.deadline) {
        return 1;
      }
      return 0;
    });
  };

  const addTodo = () => {
    if (newTodo.trim() === "") return;

    const newTask: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      description: description,
      deadline: "",
      tags: [],
      priority: priority,
    };

    const updatedTodos = sortTodosByDeadline([...todos, newTask]);
    setTodos(updatedTodos);
    setNewTodo("");
    setPriority("medium");
    setDescription("");
  };

  const toggleComplete = (id: number) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(sortTodosByDeadline(updatedTodos));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(sortTodosByDeadline(JSON.parse(savedTodos)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("tagsColors", JSON.stringify(tagsColors));
  }, [tagsColors]);

  const openModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setPriority(todo.priority || "medium");
    setDescription(todo.description || "");
    setModalOpen(true);
  };

  const saveDetails = () => {
    if (selectedTodo) {
      const updatedTodos = todos.map((todo) =>
        todo.id === selectedTodo.id
          ? { ...todo, priority, description: description, deadline: selectedTodo.deadline, tags: selectedTodo.tags }
          : todo
      );
      setTodos(sortTodosByDeadline(updatedTodos));
      setModalOpen(false);
    }
  };

  const addTag = () => {
    if (!selectedTodo || !newTag.trim()) return;

    if (selectedTodo.tags?.includes(newTag)) {
      setNewTag("");
      return;
    }

    if (!tagsColors[newTag]) {
      const newColor = getRandomColor();
      setTagsColors((prev) => ({
        ...prev,
        [newTag]: newColor,
      }));
    }

    setSelectedTodo({
      ...selectedTodo,
      tags: [...(selectedTodo.tags || []), newTag],
    });
    setNewTag("");
  };

  const deleteTag = (tag: string) => {
    if (!selectedTodo) return;

    setSelectedTodo({
      ...selectedTodo,
      tags: selectedTodo.tags?.filter((t) => t !== tag),
    });
  };

  const isDeadlineNear = (todo: Todo) => {
    if (!todo.deadline || todo.completed) return false;
    const today = new Date();
    const taskDeadline = new Date(todo.deadline);
    const differenceInDays = (taskDeadline.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return differenceInDays <= 1 && differenceInDays >= 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-blue-950 md:font-bold">
      <Head>
        <title>Yapılacaklar Listesi</title>
      </Head>
      <main className="flex justify-center h-screen p-4">
        <div className="max-w-md w-full p-5 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-4">Yapılacaklar Listesi</h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Yeni bir görev ekle"
              className="w-full px-3 py-2 text-black border rounded-l-md focus:outline-none"
            />
            <button
              onClick={addTodo}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
            >
              Ekle
            </button>
          </div>
          <ul>
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="relative flex flex-col items-start mb-2 p-2 bg-gray-50 rounded-md shadow-sm"
              >
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mr-2"
                  />
                  <span
                    className={`flex-1 cursor-pointer ${todo.completed ? "line-through text-gray-500" :
                      todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed
                        ? "text-red-600" : "text-blue-950"
                      }`}
                    onClick={() => openModal(todo)}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Sil
                  </button>
                </div>
                {todo.deadline && (
                  <span className="text-sm text-gray-500">
                    Son Tarih: {todo.deadline}
                  </span>
                )}
                <span
                  className={`px-2 py-1 mt-1 text-xs rounded ${priorityColors[todo.priority || "medium"]}`}
                >
                  {todo.priority === "low" ? "Düşük Öncelik" : todo.priority === "high" ? "Yüksek Öncelik" : "Orta Öncelik"}
                </span>
                <div className="mt-2">
                  {todo.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs rounded bg-gray-200"
                      style={{ backgroundColor: tagsColors[tag] }}
                    >
                      {tag}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTag(tag);
                        }}
                        className="ml-1  text-xs text-red-500"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
                {isDeadlineNear(todo) && !todo.completed && (
                  <div className="absolute top-0 right-0 p-2 text-xs text-white bg-red-500 rounded-tl-md">
                    Son 1 gün kaldı!
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {modalOpen && selectedTodo && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Görev Detayları</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold">Görev: {selectedTodo.text}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Açıklama"
                className="mt-2 w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold">Son Tarih</label>
              <input
                type="date"
                value={selectedTodo.deadline || ""}
                onChange={(e) =>
                  setSelectedTodo({ ...selectedTodo, deadline: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                min={today}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold">Öncelik</label>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setPriority("low")}
                  className={`px-4 py-2 rounded ${priority === "low" ? "bg-green-400" : "bg-gray-200"}`}
                >
                  Düşük
                </button>
                <button
                  onClick={() => setPriority("medium")}
                  className={`px-4 py-2 rounded ${priority === "medium" ? "bg-yellow-400" : "bg-gray-200"}`}
                >
                  Orta
                </button>
                <button
                  onClick={() => setPriority("high")}
                  className={`px-4 py-2 rounded ${priority === "high" ? "bg-red-400" : "bg-gray-200"}`}
                >
                  Yüksek
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold">Etiketler</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Yeni Etiket"
                  className="text-black px-3 py-2 border rounded-l-md w-full focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
                >
                  Ekle
                </button>
              </div>
            </div>

            <button
              onClick={saveDetails}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 w-full"
            >
              Kaydet
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md mt-2 w-full"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;