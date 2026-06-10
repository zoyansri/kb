import React, { useState } from 'react';
import './style.css';

const formatDate = (date) => {
  const d = new Date(date);
  return String(d.getDate()).padStart(2, '0');
};

function App() {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  const [cards, setCards] = useState([]);
  const [creationDate, setCreationDate] = useState({});
  const [lastStagingId, setLastStagingId] = useState(null);

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", String(card.id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (newStatus, e) => {
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;
    const parsedId = parseInt(cardId, 10);

    setCards(prev =>
      prev.map(c =>
        c.id === parsedId ? { ...c, status: newStatus } : c
      )
    );

    if (newStatus === "staging") {
      setLastStagingId(parsedId);
    }
  };

  const addCard = () => {
    const newId = cards.length + 1;
    const newCard = {
      id: newId,
      title: `Task ${newId}`,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'staging',
      assignee: null
    };
    setCards([...cards, newCard]);
    setCreationDate(prev => ({ ...prev, [newId]: new Date() }));
    setLastStagingId(newId);
  };

  const deleteCard = (id) => {
    setCards(prev => prev.filter(card => card.id !== id));
    setCreationDate(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setLastStagingId(null);
  };

  // Timeline calculations
  let chartStartDate = new Date();
  let chartEndDate = new Date();
  if (cards.length > 0) {
    chartStartDate = new Date(
      Math.min(
        ...Object.values(creationDate).map(d => d.getTime()),
        ...cards.map(c => new Date(c.dueDate).getTime())
      )
    );
    chartEndDate = new Date(
      Math.max(
        ...Object.values(creationDate).map(d => d.getTime()),
        ...cards.map(c => new Date(c.dueDate).getTime())
      )
    );
  }

  const days = [];
  if (cards.length > 0) {
    for (let d = new Date(chartStartDate); d <= chartEndDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
  }

  return (
    <div>
      <div className="buttons" id="first-section">
        <div className="button" onClick={() => scrollToSection('kanban-view')}>Kanban view</div>
        <div className="button" onClick={() => scrollToSection('list-view')}>List view</div>
        <div className="button" onClick={() => scrollToSection('timeline-view')}>Timeline view</div>
      </div>

      <hr />

      <div className="kanban view" id="kanban-view">
        <h1>Kanban Board</h1>
        <div id="kanban">
          {["todo", "in-progress", "in-review", "done", "staging"].map((col) => (
            <div
              key={col}
              className={`kanban-column ${col === "staging" ? "staging" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(col, e)}
            >
              <h2>{col.replace("-", " ")}</h2>

              {col === "staging" && (
                <div className="staging-controls">
                  <button onClick={addCard}>+</button>
                  <button onClick={() => {
                    if (lastStagingId) deleteCard(lastStagingId);
                  }}>x</button>
                </div>
              )}

              {cards.filter(c => c.status === col).map((c) => (
                <div
                  key={c.id}
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, c)}
                >
                  <div className="line-first">
                    <span className="task-name">{c.title}</span>
                    <span className="priority">{c.priority}</span>
                  </div>
                  <div className="line-second">
                    <div className="person-info">
                      <div className="profile">{getInitials(c.assignee) || "??"}</div>
                      <span className="name">{c.assignee || "Unknown"}</span>
                    </div>
                    <div className="due-date">
                      <span>{c.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="list view" id="list-view">
        <h1>Task List</h1>
        <table className="list-table">
          <thead>
              
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Assigee</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>
                  <select
                    value={c.priority}
                    onChange={(e) =>
                      setCards((prev) =>
                        prev.map((card) =>
                          card.id === c.id ? { ...card, priority: e.target.value } : card
                        )
                      )
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={c.dueDate}
                    onChange={(e) =>
                      setCards((prev) =>
                        prev.map((card) =>
                          card.id === c.id ? { ...card, dueDate: e.target.value } : card
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <select
                    value={c.status}
                    onChange={(e) =>
                      setCards((prev) =>
                        prev.map((card) =>
                          card.id === c.id ? { ...card, status: e.target.value } : card
                        )
                      )
                    }
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="done">Done</option>
                    <option value="staging">Staging</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={c.assignee || ""}
                    onChange={(e) =>
                      setCards((prev) =>
                        prev.map((card) =>
                          card.id === c.id ? { ...card, assignee: e.target.value } : card
                        )
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr />

      <div className="timeline view" id="timeline-view">
        <h1>Timeline (Gantt Chart)</h1>
        <table className="gantt">
          <thead>
            <tr>
              <th>Time</th>
              {days.map((day, idx) => (
                <th key={idx}>{formatDate(day)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => {
              const start = creationDate[c.id];
              const end = new Date(c.dueDate);

              return (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  {days.map((day, idx) => {
                    const inRange = start && day >= start && day <= end;
                    return (
                      <td
                        key={idx}
                        className={inRange ? `bar ${c.priority}` : ""}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
