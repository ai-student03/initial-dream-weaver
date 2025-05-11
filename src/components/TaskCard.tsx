
import React from 'react';
import { Task } from '@/lib/types';
import { Check, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  
  return (
    <div
      className={cn(
        'task-card',
        `priority-${task.priority}`,
        task.completed && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          <div>
            <h3 className={cn(
              "font-medium",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span 
              key={tag.id} 
              className="tag"
              style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      
      {task.dueDate && (
        <div className={cn(
          "mt-3 flex items-center text-xs",
          isOverdue ? "text-destructive" : "text-muted-foreground"
        )}>
          <Clock className="mr-1 h-3 w-3" />
          Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
