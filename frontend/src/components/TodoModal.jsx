import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TodoModal({ date, todos, onClose }) {
  const [newTodo, setNewTodo] = useState('');
  const [currentTodos, setCurrentTodos] = useState(todos);
  const [memoContent, setMemoContent] = useState('');  // 🟡 메모 상태

  const getTodos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/todos?date=${date}`);
      setCurrentTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const getMemo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/memos?date=${date}`);
      setMemoContent(response.data.content);
    } catch (error) {
      console.error("Error fetching memo:", error);
    }
  };

  const handleSaveMemo = async () => {
    try {
      await axios.post('http://localhost:5000/memos', {
        date: date,
        content: memoContent
      });
      alert("메모가 저장되었습니다!");
    } catch (error) {
      console.error("Error saving memo:", error);
    }
  };

  const addTodo = async () => {
    if (!newTodo) return;
    try {
      const response = await axios.post('http://localhost:5000/todos', {
        date: date,
        content: newTodo,
      });
      setNewTodo('');
      getTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${todoId}`);
      getTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleCheck = async (todoId, isChecked) => {
    try {
      await axios.put(`http://localhost:5000/todos/${todoId}`, {
        is_checked: !isChecked,
      });
      getTodos();
    } catch (error) {
      console.error("Error toggling todo check:", error);
    }
  };

  useEffect(() => {
    getTodos();
    getMemo(); // 📥 모달 열릴 때 메모 불러오기
  }, [date]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        width: '80%',
        maxWidth: '400px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ❌
        </button>

        <h3>{date}의 할 일</h3>

        <ul>
          {currentTodos.map((todo) => (
            <li key={todo.id} style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={todo.is_checked}
                onChange={() => toggleCheck(todo.id, todo.is_checked)}
                style={{ marginRight: '10px' }}
              />
              {todo.content}
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  marginLeft: '10px',
                  backgroundColor: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새 할 일 입력"
          style={{ width: '100%', padding: '10px', marginTop: '10px' }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          할 일 추가
        </button>

        <h4 style={{ marginTop: '20px' }}>메모</h4>
        <textarea
          value={memoContent}
          onChange={(e) => setMemoContent(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '10px' }}
        />
        <button
          onClick={handleSaveMemo}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px',
            borderRadius: '4px'
          }}
        >
          메모 저장
        </button>
      </div>
    </div>
  );
}

export default TodoModal;
