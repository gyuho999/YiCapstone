import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoModal from '../components/TodoModal';

function CalendarLayout() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState({});
  const [showSelector, setShowSelector] = useState(false);
  const [memos, setMemos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentMemo, setCurrentMemo] = useState('');

  const getDateKey = (y, m, d) => `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  useEffect(() => {
    const fetchTodosByUser = async () => {
      const userId = 1;
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/todos?user_id=${userId}`);
        const allTodos = response.data;

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const filteredTodos = allTodos.filter(todo => {
          const todoDate = new Date(todo.date);
          return todoDate >= startDate && todoDate <= endDate;
        });

        const grouped = {};
        filteredTodos.forEach(todo => {
          if (!grouped[todo.date]) grouped[todo.date] = [];
          grouped[todo.date].push(todo);
        });

        setTodos(grouped);
      } catch (error) {
        console.error('Error loading todos by user:', error);
      }
    };

    fetchTodosByUser();
  }, [year, month]);

  const fetchMemo = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5000/memos?date=${date}`);
      setCurrentMemo(response.data.content);
    } catch (error) {
      console.error('Error loading memo:', error);
      setCurrentMemo('');
    }
  };

  const handleDateClick = (day) => {
    const newDate = getDateKey(year, month, day);
    setSelectedDate(newDate);
    fetchMemo(newDate);
    setShowModal(true);
  };

  const saveMemo = async () => {
    if (!selectedDate) return;
    try {
      await axios.post('http://localhost:5000/memos', {
        date: selectedDate,
        content: currentMemo,
      });
      setMemos(prev => ({ ...prev, [selectedDate]: currentMemo }));
      alert('메모가 저장되었습니다.');
    } catch (error) {
      console.error('Memo 저장 오류:', error);
    }
  };

  const renderDots = (count) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} style={{
            width: '6px', height: '6px', backgroundColor: '#000', borderRadius: '50%'
          }} />
        ))}
      </div>
    );
  };

  const handleSelect = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
    setShowSelector(false);
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#e9f3ef' }}>
      <div style={{ flex: 1, padding: '10px', backgroundColor: '#e9f3ef' }}>
        <h2 style={{ fontFamily: "'Pacifico', cursive" }}>ToDo</h2>
        <div style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>
          {selectedDate || now.toISOString().slice(0, 10)}
        </div>
        <textarea
          rows={6}
          placeholder="메모를 입력하세요"
          value={currentMemo}
          onChange={(e) => setCurrentMemo(e.target.value)}
          style={{ width: '90%', aspectRatio: '1 / 1', backgroundColor: '#fff', borderRadius: '12px', padding: '10px', fontSize: '14px' }}
        />
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={saveMemo}
            style={{ backgroundColor: '#2ecc71', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            메모 저장
          </button>
        </div>
      </div>

      <div style={{ flex: 2, padding: '50px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button onClick={handlePrevMonth}>◀</button>
          <div onClick={() => setShowSelector(!showSelector)}>{year}.{(month + 1).toString().padStart(2, '0')}</div>
          <button onClick={handleNextMonth}>▶</button>
        </div>
        {showSelector && (
          <div>
            <select value={year} onChange={e => handleSelect(Number(e.target.value), month)}>
              {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={month} onChange={e => handleSelect(year, Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{(i + 1).toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
          {weekDays.map((day, idx) => (
            <div key={idx} style={{ textAlign: 'center', color: idx === 0 ? '#e57373' : idx === 6 ? '#64b5f6' : '#999' }}>{day}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '30px' }}>
          {Array.from({ length: firstDay + daysInMonth }, (_, i) => {
            if (i < firstDay) return <div key={i}></div>;
            const day = i - firstDay + 1;
            const dateKey = getDateKey(year, month, day);
            const todoList = todos[dateKey] || [];
            const dayOfWeek = new Date(dateKey).getDay();
            const isSelected = selectedDate === dateKey;

            return (
              <div
                key={i}
                onClick={() => handleDateClick(day)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? '#d1f2eb' : 'transparent',
                  color: dayOfWeek === 0 ? '#e57373' : dayOfWeek === 6 ? '#64b5f6' : '#444',
                  transition: 'background-color 0.2s'
                }}
              >
                <div>{day}</div>
                {todoList.length > 0 && renderDots(todoList.length)}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedDate && (
        <TodoModal
          date={selectedDate}
          todos={todos[selectedDate] || []}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default CalendarLayout;
