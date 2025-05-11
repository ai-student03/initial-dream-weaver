
import React from 'react';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { motion } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  emptyState?: React.ReactNode;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleComplete, 
  onDelete, 
  emptyState 
}) => {
  if (tasks.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <TaskCard
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;
