import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, User, LogOut, Check, X } from 'lucide-react';
import appLogo from '/src/assets/icon.png';

const TaskManagerApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, username: 'gaurav', password: 'Gaurav', role: 'user' }
  ]);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Sample Task',
      description: 'This is a sample task',
      dueDate: '2025-10-10',
      status: 'todo',
      priority: 'high',
      assignedTo: 1,
      createdBy: 1
    }
  ]);

  useEffect(() => {
  document.title = currentUser
    ? `Task Manager | ${currentUser.username}`
    : 'Task Manager | Login';
}, [currentUser]);


  useEffect(() => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    setCurrentUser(JSON.parse(savedUser));
  }
}, []);

const isOverdue = (task) => {
  if (task.status === 'completed') return false;
  const today = new Date();
  const due = new Date(task.dueDate);
  return due < today;
};

const overdueBadgeStyle =
  'bg-rose-900/40 text-rose-300 border border-rose-700';


  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', 
    description: '', 
    dueDate: '', 
    status: 'todo', 
    priority: 'medium', 
    assignedTo: 1
  });
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPriority, setFilterPriority] = useState('all');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  const tasksPerPage = 5;

  useEffect(() => {
    if (users.length > 0 && !taskForm.assignedTo) {
      setTaskForm(prev => ({ ...prev, assignedTo: users[0].id }));
    }
  }, [users]);

  useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);


  const handleLogin = () => {
    const user = users.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowTaskForm(false);
    setEditingTask(null);
    setViewingTask(null);
  };

  const handleAddUser = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Only admins can add users');
      return;
    }
    if (!newUser.username || !newUser.password) {
      alert('Please fill all fields');
      return;
    }
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    setUsers([...users, { ...newUser, id: newId }]);
    setNewUser({ username: '', password: '', role: 'user' });
    alert('User added successfully');
  };

  const handleRemoveUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Only admins can remove users');
      return;
    }
    if (userId === currentUser.id) {
      alert('Cannot remove yourself');
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
    alert('User removed successfully');
  };

  const handleTaskSubmit = () => {
    if (!taskForm.title || !taskForm.description || !taskForm.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
      setEditingTask(null);
    } else {
      const newTask = { 
        ...taskForm, 
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        createdBy: currentUser.id 
      };
      setTasks([...tasks, newTask]);
    }
    setShowTaskForm(false);
    setTaskForm({ 
      title: '', 
      description: '', 
      dueDate: '', 
      status: 'todo', 
      priority: 'medium', 
      assignedTo: users[0]?.id || 1 
    });
  };

  const openEditForm = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo
    });
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const openCreateForm = () => {
    setTaskForm({ 
      title: '', 
      description: '', 
      dueDate: '', 
      status: 'todo', 
      priority: 'medium', 
      assignedTo: users[0]?.id || 1 
    });
    setEditingTask(null);
    setShowTaskForm(true);
  };

const nextStatus = (status) => {
  if (status === 'todo') return 'in-progress';
  if (status === 'in-progress') return 'completed';
  return 'todo';
};


  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setDeleteConfirm(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handlePriorityChange = (taskId, newPriority) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(t => t.assignedTo === currentUser.id);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    return filtered;
  };

  const getPaginatedTasks = () => {
    const filtered = getFilteredTasks();
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filtered.slice(startIndex, startIndex + tasksPerPage);
  };

  const totalPages = Math.ceil(getFilteredTasks().length / tasksPerPage);

  const priorityColors = {
  low: 'bg-emerald-950/30 border-emerald-600 text-emerald-300',
  medium: 'bg-amber-950/30 border-amber-600 text-amber-300',
  high: 'bg-rose-950/30 border-rose-600 text-rose-300'
};



  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-slate-500 text-slate-100 rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-gray-600 mt-2">Sign in to continue</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
            >
              Sign In
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
            <p className="font-semibold text-gray-700 mb-2">Demo Credentials:</p>
            <p className="text-gray-600">User: gaurav / Gaurav</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 shadow-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
  <img
    src={appLogo}
    alt="Task Manager Logo"
    className="h-10 w-15 object-contain hover:scale-105 transition-transform"
  />
  <h1 className="text-2xl font-bold text-emerald-400">
    Task Manager
  </h1>
</div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser.username} ({currentUser.role})
            </span>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowUserManagement(!showUserManagement)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Manage Users
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showUserManagement && currentUser.role === 'admin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-500 text-slate-100 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button onClick={() => setShowUserManagement(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={handleAddUser} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add User
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">All Users</h3>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div>
                        <span className="font-medium">{user.username}</span>
                        <span className="ml-2 text-sm text-gray-600">({user.role})</span>
                      </div>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-500 text-slate-100 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
                <button onClick={() => setViewingTask(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Title</label>
                  <p className="text-lg text-gray-800">{viewingTask.title}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-800">{viewingTask.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Due Date</label>
                    <p className="text-slate-900">{viewingTask.dueDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <p className="text-gray-800 capitalize">{viewingTask.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Priority</label>
                    <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${priorityColors[viewingTask.priority]}`}>
                      {viewingTask.priority}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Assigned To</label>
                    <p className="text-gray-800">{users.find(u => u.id === viewingTask.assignedTo)?.username || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    openEditForm(viewingTask);
                    setViewingTask(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={() => setViewingTask(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-500 text-slate-100 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteTask(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  {editingTask && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>

                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleTaskSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>

        <div className="bg-slate-500 text-slate-100 rounded-xl shadow-2xl p-6 border">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {currentUser.role === 'admin' ? 'All Tasks' : 'My Assigned Tasks'}
            </h2>
            {getPaginatedTasks().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks found</p>
            ) : (
              <div className="space-y-3">
                {getPaginatedTasks().map(task => (
                  <div
  key={task.id}
 className={`p-4 rounded-lg border-l-4 ${
  isOverdue(task)
    ? 'border-rose-500 bg-rose-950/30'
    : task.status === 'completed'
      ? 'border-emerald-500 bg-emerald-950/30'
      : task.status === 'in-progress'
        ? 'border-indigo-500 bg-indigo-950/30'
        : 'border-slate-500 bg-slate-800'
}`}

>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">{task.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-900">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {task.dueDate}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-100">

  {task.status}
</span>

{isOverdue(task) && (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${overdueBadgeStyle}`}>
    Overdue
  </span>
)}
                          <span className="capitalize">Priority: {task.priority}</span>
                          {currentUser.role === 'admin' && (
                            <span>Assigned: {users.find(u => u.id === task.assignedTo)?.username || 'Unknown'}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingTask(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Calendar size={18} />
                        </button>
                        <button
                          onClick={() => openEditForm(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
  onClick={() => handleStatusChange(task.id, nextStatus(task.status))}
  className="p-2 text-green-600 hover:bg-green-50 rounded"
>
  <Check size={18} />
</button>

                        <button
                          onClick={() => setDeleteConfirm(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs text-slate-900 mr-2">Move to:</span>
                      {['low', 'medium', 'high'].map(priority => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(task.id, priority)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            task.priority === priority 
                              ? priorityColors[priority]
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="border-t p-4 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-slate-100 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagerApp;