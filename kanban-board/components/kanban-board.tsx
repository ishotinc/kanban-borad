'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Play, Square, Trash2, ChevronDown, Crown, Flag } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const labelColors = {
  label1: '#4DC0B2',
  label2: '#FFC042',
}

function TaskCard({ task, index, onEditTask, onStartTimer, onStopTimer, isActive, onSelectTask, availableLabels, onAddLabel }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(task.content)
  const [isWeeklyView, setIsWeeklyView] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [goalTime, setGoalTime] = useState(task.goalTime || '')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const toggleTimeView = () => {
    setIsWeeklyView(!isWeeklyView)
  }

  const getBestRecord = () => {
    if (isWeeklyView) {
      return task.weeklyBestRecord > 0 ? task.weeklyBestRecord : task.weeklyTotal + currentTime
    } else {
      return task.monthlyBestRecord > 0 ? task.monthlyBestRecord : task.monthlyTotal + currentTime
    }
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const handleContentBlur = () => {
    setIsEditing(false)
    onEditTask(task.id, { content })
  }

  const handleContentKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onEditTask(task.id, { content })
    }
  }

  const handleLabelChange = (labelIndex, newLabel) => {
    const newLabels = [...task.labels]
    newLabels[labelIndex] = newLabel
    onEditTask(task.id, { labels: newLabels })
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`w-full bg-white relative mb-2 ${task.isSelected ? 'ring-2 ring-[#37AB9D]' : ''}`}
          onClick={() => onSelectTask(task)}
        >
          <div className="pl-6 py-1">
            <CardHeader className="p-1 pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex flex-wrap gap-1 flex-grow">
                  {[0, 1].map((labelIndex) => (
                    <DropdownMenu key={labelIndex}>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          className="cursor-pointer"
                          style={{ backgroundColor: labelColors[`label${labelIndex + 1}`] }}
                        >
                          {task.labels[labelIndex] || `Label ${labelIndex + 1}`}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {availableLabels.map((label) => (
                          <DropdownMenuItem key={label} onSelect={() => handleLabelChange(labelIndex, label)}>
                            {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onSelect={() => onAddLabel(labelIndex)}>
                          <span className="text-blue-500">+ Add label</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditTask(task.id, { deleted: true })
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  aria-label="タスクを削除"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm flex-grow">
                  {isEditing ? (
                    <Input
                      value={content}
                      onChange={handleContentChange}
                      onKeyDown={handleContentKeyDown}
                      onBlur={handleContentBlur}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm p-1 h-7"
                    />
                  ) : (
                    <span onClick={() => setIsEditing(true)}>{content}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-1">
              <div className="text-xs flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTimeView()
                    }}
                    variant="outline"
                    size="sm"
                    className="p-1 h-6 text-xs flex items-center gap-1 border-dashed"
                  >
                    {isWeeklyView ? 'W' : 'M'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center">
                    <Flag className="h-3 w-3 mr-1 text-yellow-500 cursor-pointer" onClick={() => setIsEditingGoal(true)} />
                    {isEditingGoal ? (
                      <Input
                        value={goalTime}
                        onChange={(e) => setGoalTime(e.target.value)}
                        onBlur={() => {
                          setIsEditingGoal(false)
                          onEditTask(task.id, { goalTime })
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditingGoal(false)
                            onEditTask(task.id, { goalTime })
                          }
                        }}
                        className="w-12 h-6 text-xs"
                        placeholder="分"
                      />
                    ) : (
                      <span>{goalTime ? `${goalTime}m` : ''}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="whitespace-nowrap">
                    累計: {formatTime(isWeeklyView ? task.weeklyTotal + currentTime : task.monthlyTotal + currentTime)}
                  </span>
                  {task.isSelected && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        isActive ? onStopTimer() : onStartTimer(task.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-6 w-6 rounded-full ${isActive ? 'bg-[#f14134]' : 'bg-[#f14134] bg-opacity-20'} hover:bg-[#f14134] hover:bg-opacity-30`}
                      aria-label={isActive ? "タイマーを停止" : "タイマーを開始"}
                    >
                      {isActive ? <Square className="h-3 w-3 text-white" /> : <Play className="h-3 w-3 text-[#f14134]" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </Draggable>
  )
}

function TaskList({ column, tasks, index, onEditListTitle, onAddTask, onEditTask, onStartTimer, onStopTimer, activeTaskId, onSelectTask, availableLabels, onAddLabel }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
    onEditListTitle(column.id, title)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      onEditListTitle(column.id, title)
    }
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-80"
        >
          <Card className="bg-gray-100">
            <CardHeader {...provided.dragHandleProps} className="py-2">
              {isEditing ? (
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleBlur}
                  autoFocus
                />
              ) : (
                <h2 className="font-semibold cursor-pointer" onClick={() => setIsEditing(true)}>
                  {column.title}
                </h2>
              )}
            </CardHeader>
            <CardContent className="py-1 bg-gray-100">
              <Button
                onClick={() => onAddTask(column.id)}
                className="w-full mb-2 bg-gray-100 hover:bg-gray-200 text-gray-600"
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Droppable droppableId={column.id} type="task">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onEditTask={onEditTask}
                        onStartTimer={onStartTimer}
                        onStopTimer={onStopTimer}
                        isActive={task.id === activeTaskId}
                        onSelectTask={onSelectTask}
                        availableLabels={availableLabels}
                        onAddLabel={onAddLabel}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )
}

function PersistentHeader({ activeTask, elapsedTime, onStopTimer, onStartTimer }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center justify-between bg-[#37AB9D] text-white p-4 mb-4 rounded-lg">
      <div className="flex items-center space-x-2 flex-grow">
        {activeTask && (
          <>
            <Badge style={{ backgroundColor: labelColors.label1 }}>{activeTask.labels[0]}</Badge>
            <Badge style={{ backgroundColor: labelColors.label2 }}>{activeTask.labels[1]}</Badge>
            <span className="font-bold">{activeTask.content}</span>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold">{formatTime(elapsedTime)}</span>
        {activeTask && (
          <Button 
            onClick={activeTask.isActive ? onStopTimer : () => onStartTimer(activeTask.id)} 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-[#f14134] text-white hover:bg-[#d63a2f]"
          >
            {activeTask.isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}

export function KanbanBoardComponent() {
  const [state, setState] = useState({
    tasks: {
      'task-1': { id: 'task-1', content: 'タスク1', labels: ['重要', '緊急'], assignee: 'John', timeSpent: 0, weeklyTotal: 3600, monthlyTotal: 7200, goalTime: '', isActive: false, isSelected: false },
      'task-2': { id: 'task-2', content: 'タスク2', labels: ['低優先', '長期'], assignee: 'Jane', timeSpent: 0, weeklyTotal: 1800, monthlyTotal: 3600, goalTime: '', isActive: false, isSelected: false },
      'task-3': { id: 'task-3', content: 'タスク3', labels: ['中優先', '短期'], assignee: 'Bob', timeSpent: 0, weeklyTotal: 2700, monthlyTotal: 5400, goalTime: '', isActive: false, isSelected: false },
    },
    columns: {
      'column-1': {
        id: 'column-1',
        title: '未着手',
        taskIds: ['task-1', 'task-2', 'task-3'],
      },
      'column-2': {
        id: 'column-2',
        title: '進行中',
        taskIds: [],
      },
      'column-3': {
        id: 'column-3',
        title: '完了',
        taskIds: [],
      },
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
  })
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedTask, setSelectedTask] = useState(state.tasks['task-1'])
  const [availableLabels, setAvailableLabels] = useState(['重要', '緊急', '低優先', '中優先', '長期', '短期'])
  const [isAddingLabel, setIsAddingLabel] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingLabelIndex, setEditingLabelIndex] = useState(null)

  const updateTaskTime = useCallback(() => {
    if (activeTaskId) {
      setState((prevState) => ({
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [activeTaskId]: {
            ...prevState.tasks[activeTaskId],
            timeSpent: prevState.tasks[activeTaskId].timeSpent + 1,
          },
        },
      }))
    }
  }, [activeTaskId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTaskId) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1)
        updateTaskTime()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTaskId, updateTaskTime])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(state.columnOrder)
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      const newState = {
        ...state,
        columnOrder: newColumnOrder,
      }
      setState(newState)
      return
    }

    const start = state.columns[source.droppableId]
    const finish = state.columns[destination.droppableId]

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      }

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      }

      setState(newState)
      return
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    }

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }
    setState(newState)
  }

  const handleAddList = () => {
    const newColumnId = `column-${state.columnOrder.length + 1}`
    const newColumn = {
      id: newColumnId,
      title: '新しいリスト',
      taskIds: [],
    }
    setState({
      ...state,
      columns: {
        ...state.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...state.columnOrder, newColumnId],
    })
  }

  const handleEditListTitle = (columnId, newTitle) => {
    setState({
      ...state,
      columns: {
        ...state.columns,
        [columnId]: {
          ...state.columns[columnId],
          title: newTitle,
        },
      },
    })
  }

  const handleAddTask = (columnId) => {
    const newTaskId = `task-${Object.keys(state.tasks).length + 1}`
    const newTask = {
      id: newTaskId,
      content: '新しいタスク',
      labels: [],
      assignee: '',
      timeSpent: 0,
      weeklyTotal: 0,
      monthlyTotal: 0,
      goalTime: '',
      weeklyBestRecord: 0,
      monthlyBestRecord: 0,
      isActive: false,
      isSelected: false
    }
    setState((prevState) => ({
      ...prevState,
      tasks: {
        ...prevState.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...prevState.columns,
        [columnId]: {
          ...prevState.columns[columnId],
          taskIds: [newTaskId, ...prevState.columns[columnId].taskIds],
        },
      },
    }))
  }

  const handleEditTask = (taskId, updatedFields) => {
    setState((prevState) => {
      const task = prevState.tasks[taskId]
      if (!task) {
        console.error(`Task with id ${taskId} not found`)
        return prevState
      }
      if (updatedFields.deleted) {
        const newTasks = { ...prevState.tasks }
        delete newTasks[taskId]
        const newColumns = Object.keys(prevState.columns).reduce((acc, columnId) => {
          acc[columnId] = {
            ...prevState.columns[columnId],
            taskIds: prevState.columns[columnId].taskIds.filter(id => id !== taskId)
          }
          return acc
        }, {})
        return {
          ...prevState,
          tasks: newTasks,
          columns: newColumns
        }
      }
      // Convert goalTime to minutes if it's a valid number
      if (updatedFields.goalTime) {
        const goalTimeNumber = parseInt(updatedFields.goalTime, 10)
        if (!isNaN(goalTimeNumber)) {
          updatedFields.goalTime = goalTimeNumber.toString()
        } else {
          delete updatedFields.goalTime
        }
      }
      return {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [taskId]: {
            ...task,
            ...updatedFields,
          },
        },
      }
    })
  }

  const handleStartTimer = (taskId) => {
    if (activeTaskId) {
      handleStopTimer();
    }
    setActiveTaskId(taskId);
    setElapsedTime(0);
    setState(prevState => {
      const updatedTask = {
        ...prevState.tasks[taskId],
        isActive: true,
        isSelected: true
      };
      setSelectedTask(updatedTask);
      return {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [taskId]: updatedTask
        }
      };
    });
  }

  const handleStopTimer = () => {
    if (activeTaskId) {
      setState(prevState => {
        const task = prevState.tasks[activeTaskId]
        const newWeeklyTotal = task.weeklyTotal + elapsedTime
        const newMonthlyTotal = task.monthlyTotal + elapsedTime
        return {
          ...prevState,
          tasks: {
            ...prevState.tasks,
            [activeTaskId]: {
              ...task,
              isActive: false,
              weeklyTotal: newWeeklyTotal,
              monthlyTotal: newMonthlyTotal,
              weeklyBestRecord: Math.max(task.weeklyBestRecord, newWeeklyTotal),
              monthlyBestRecord: Math.max(task.monthlyBestRecord, newMonthlyTotal),
            }
          }
        }
      })
    }
    setActiveTaskId(null);
    setElapsedTime(0);
  }

  const handleSelectTask = (task) => {
    setState(prevState => ({
      ...prevState,
      tasks: Object.fromEntries(
        Object.entries(prevState.tasks).map(([id, t]) => [
          id,
          { ...t, isSelected: id === task.id }
        ])
      )
    }));
    setSelectedTask(task);
    if (task.isActive) {
      setActiveTaskId(task.id);
      setElapsedTime(task.timeSpent);
    }
  }

  const handleAddLabel = (labelIndex) => {
    setEditingLabelIndex(labelIndex);
    setIsAddingLabel(true);
  }

  const handleSaveNewLabel = () => {
    if (newLabel && !availableLabels.includes(newLabel)) {
      setAvailableLabels([...availableLabels, newLabel]);
      if (editingLabelIndex !== null && selectedTask) {
        handleEditTask(selectedTask.id, {
          labels: [
            ...selectedTask.labels.slice(0, editingLabelIndex),
            newLabel,
            ...selectedTask.labels.slice(editingLabelIndex + 1)
          ]
        });
      }
      setNewLabel('');
      setIsAddingLabel(false);
      setEditingLabelIndex(null);
    }
  }

  return (
    <div className="p-4 bg-white">
      <PersistentHeader
        activeTask={selectedTask}
        elapsedTime={elapsedTime}
        onStopTimer={handleStopTimer}
        onStartTimer={handleStartTimer}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex space-x-4"
            >
              {state.columnOrder.map((columnId, index) => {
                const column = state.columns[columnId]
                const tasks = column.taskIds.map((taskId) => state.tasks[taskId]).filter(Boolean)

                return (
                  <TaskList
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    onEditListTitle={handleEditListTitle}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    activeTaskId={activeTaskId}
                    onSelectTask={handleSelectTask}
                    availableLabels={availableLabels}
                    onAddLabel={handleAddLabel}
                  />
                )
              })}
              {provided.placeholder}
              <div className="w-80">
                <Button 
                  onClick={handleAddList} 
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600" 
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> リストを追加
                </Button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Dialog open={isAddingLabel} onOpenChange={setIsAddingLabel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいラベルを追加</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-label" className="text-right">
                ラベル名
              </Label>
              <Input
                id="new-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveNewLabel}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}