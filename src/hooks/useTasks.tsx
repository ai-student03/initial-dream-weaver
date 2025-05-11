
import { useState, useCallback, useMemo } from 'react';
import { Task, Priority, Tag } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

// Sample tags
const defaultTags: Tag[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#8b5cf6' },
  { id: '3', name: 'Urgent', color: '#ef4444' },
  { id: '4', name: 'Learning', color: '#10b981' },
];

// Sample initial tasks
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish and submit the Q3 project proposal to management',
    completed: false,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    priority: 'high',
    tags: [defaultTags[0], defaultTags[2]],
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up weekly team sync meeting for project updates',
    completed: true,
    createdAt: new Date(),
    dueDate: new Date(Date.now() - 86400000), // 1 day ago
    priority: 'medium',
    tags: [defaultTags[0]],
  },
  {
    id: '3',
    title: 'Learn React hooks',
    description: 'Go through documentation and practice using useCallback and useMemo',
    completed: false,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
    priority: 'low',
    tags: [defaultTags[3]],
  },
  {
    id: '4',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables, fruits',
    completed: false,
    createdAt: new Date(),
    priority: 'medium',
    tags: [defaultTags[1]],
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tags, setTags] = useState<Tag[]>(defaultTags);

  // Add a new task
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    toast.success('Task created successfully');
    return newTask;
  }, []);

  // Update an existing task
  const updateTask = useCallback((id: string, task: Partial<Task>) => {
    setTasks((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...task } : t))
    );
    toast.success('Task updated successfully');
  }, []);

  // Delete a task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.success('Task deleted successfully');
  }, []);

  // Toggle task completion status
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  // Add a new tag
  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag = { ...tag, id: Date.now().toString() };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const priorityCounts = {
      high: tasks.filter((task) => task.priority === 'high').length,
      medium: tasks.filter((task) => task.priority === 'medium').length,
      low: tasks.filter((task) => task.priority === 'low').length,
    };
    
    const overdue = tasks.filter((task) => 
      task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
    ).length;

    return {
      completed,
      total,
      completionRate,
      priorityCounts,
      overdue,
    };
  }, [tasks]);

  return {
    tasks,
    tags,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addTag,
    stats,
  };
}
