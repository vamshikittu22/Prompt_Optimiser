import { useState } from 'react';
import { PromptWorkflow } from './components/PromptWorkflow';
import { TaskManager } from './utils/fileUtils';

function App() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showTaskList, setShowTaskList] = useState(false);
  const [tasks, setTasks] = useState(() => TaskManager.getAllTasks());

  const handleTaskComplete = (_taskId: string) => {
    // Refresh tasks list
    setTasks(TaskManager.getAllTasks());
  };

  const handleNewTask = () => {
    setActiveTaskId(null);
    setShowTaskList(false);
  };

  const handleTaskSelect = (taskId: string) => {
    setActiveTaskId(taskId);
    setShowTaskList(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Prompt Optimizer</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTaskList(!showTaskList)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {activeTaskId ? 'Switch Task' : 'View Tasks'}
            </button>
            <button
              onClick={handleNewTask}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              New Task
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {showTaskList ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Tasks</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Select a task to continue working on it</p>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <li key={task.id}>
                      <button
                        onClick={() => handleTaskSelect(task.id)}
                        className="block hover:bg-gray-50 w-full text-left"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {task.idea.substring(0, 100)}
                              {task.idea.length > 100 ? '...' : ''}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {task.status}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Created: {new Date(task.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No tasks found. Create a new task to get started.
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <PromptWorkflow
            taskId={activeTaskId || undefined}
            onComplete={handleTaskComplete}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Prompt Optimizer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
