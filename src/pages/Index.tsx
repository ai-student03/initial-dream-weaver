
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import StatsCard from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, ClipboardList, AlertTriangle } from 'lucide-react';

const Index: React.FC = () => {
  const { tasks, tags, addTask, toggleTaskCompletion, deleteTask, stats } = useTasks();
  
  // Filter states
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  
  // Filtered tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    switch (activeTab) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  // Sort tasks: incomplete high priority first, then incomplete medium, then incomplete low, then completed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // If both are incomplete, sort by priority
    if (!a.completed && !b.completed) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // If both are complete, sort by recency (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Empty states for different tabs
  const emptyStates = {
    all: (
      <div className="flex flex-col items-center justify-center py-10">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No tasks yet</h3>
        <p className="text-muted-foreground mt-1">
          Create a task using the "Add Task" button above
        </p>
      </div>
    ),
    active: (
      <div className="flex flex-col items-center justify-center py-10">
        <CheckCircle2 className="h-12 w-12 text-taskflow-green mb-4" />
        <h3 className="text-xl font-medium">All caught up!</h3>
        <p className="text-muted-foreground mt-1">
          You've completed all your tasks
        </p>
      </div>
    ),
    completed: (
      <div className="flex flex-col items-center justify-center py-10">
        <AlertTriangle className="h-12 w-12 text-taskflow-amber mb-4" />
        <h3 className="text-xl font-medium">No completed tasks</h3>
        <p className="text-muted-foreground mt-1">
          Start checking off tasks to see them here
        </p>
      </div>
    ),
  };

  return (
    <div className="container max-w-5xl px-4">
      <Header tags={tags} onAddTask={addTask} />
      
      <div className="mb-6">
        <StatsCard stats={stats} />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <TaskList
            tasks={sortedTasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            emptyState={emptyStates.all}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <TaskList
            tasks={sortedTasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            emptyState={emptyStates.active}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <TaskList
            tasks={sortedTasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            emptyState={emptyStates.completed}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
