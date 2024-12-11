import React, { useState } from 'react';
import Main from '@/Layouts/Main';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    Search,
    Plus,
    MoreVertical,
    X,
    Upload,
    Minus,
    GripVertical
} from 'lucide-react';

// Dummy Data
const dummyData = {
    'to_do': [
        {
            id: 1,
            title: "Design New Homepage",
            description: "Create a modern and responsive homepage design",
            status: "to_do",
            image_url: null,
            lists: [
                { id: 1, task_id: 1, list_text: "Create wireframe", is_completed: false },
                { id: 2, task_id: 1, list_text: "Design UI components", is_completed: false },
                { id: 3, task_id: 1, list_text: "Implement responsive layout", is_completed: false }
            ]
        },
        {
            id: 2,
            title: "Backend Integration",
            description: "Integrate the API endpoints with frontend",
            status: "to_do",
            image_url: null,
            lists: [
                { id: 4, task_id: 2, list_text: "Setup API routes", is_completed: false },
                { id: 5, task_id: 2, list_text: "Implement authentication", is_completed: true }
            ]
        }
    ],
    'in_progress': [
        {
            id: 3,
            title: "Database Migration",
            description: "Migrate existing database to new structure",
            status: "in_progress",
            image_url: null,
            lists: [
                { id: 6, task_id: 3, list_text: "Backup current database", is_completed: true },
                { id: 7, task_id: 3, list_text: "Create migration scripts", is_completed: false },
                { id: 8, task_id: 3, list_text: "Test migration process", is_completed: false }
            ]
        }
    ],
    'completed': [
        {
            id: 4,
            title: "Server Setup",
            description: "Set up and configure production server",
            status: "completed",
            image_url: null,
            lists: [
                { id: 9, task_id: 4, list_text: "Install required packages", is_completed: true },
                { id: 10, task_id: 4, list_text: "Configure security settings", is_completed: true }
            ]
        }
    ]
};

// Modal Component for Add Task
const AddTaskModal = ({ isOpen, onClose, onSubmit }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        status: 'to_do',
        image_url: '',
        lists: [{ text: '', is_completed: false }]
    });

    const handleAddList = () => {
        setTaskData(prev => ({
            ...prev,
            lists: [...prev.lists, { text: '', is_completed: false }]
        }));
    };

    const handleRemoveList = (index) => {
        setTaskData(prev => ({
            ...prev,
            lists: prev.lists.filter((_, i) => i !== index)
        }));
    };

    const handleListChange = (index, value) => {
        setTaskData(prev => ({
            ...prev,
            lists: prev.lists.map((item, i) =>
                i === index ? { ...item, text: value } : item
            )
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Task title</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter task title"
                            className="w-full p-3 border rounded-lg"
                            value={taskData.title}
                            onChange={e => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                        />

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Task description</h3>
                            <textarea
                                placeholder="Enter task description"
                                className="w-full p-3 border rounded-lg min-h-[100px]"
                                value={taskData.description}
                                onChange={e => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Task list</h3>
                            <div className="space-y-2">
                                {taskData.lists.map((list, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter list text"
                                            className="flex-1 p-3 border rounded-lg"
                                            value={list.text}
                                            onChange={e => handleListChange(index, e.target.value)}
                                        />
                                        {taskData.lists.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveList(index)}
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={handleAddList}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Add image</h3>
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                <p className="text-sm text-gray-500">
                                    Click to upload or drag and drop
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSubmit(taskData)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5 inline-block mr-2" />
                            Add task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Task Card Component
const TaskCard = ({ task, onToggleList, provided, isDragging }) => {
    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white rounded-lg shadow relative ${
                isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {task.description && (
                    <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                )}

                <div className="space-y-2">
                    {task.lists.map((list) => (
                        <div key={list.id} className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={list.is_completed}
                                onChange={() => onToggleList(task.id, list.id)}
                                className="mt-1 w-4 h-4 rounded border-gray-300"
                            />
                            <span className={list.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                                {list.list_text}
                            </span>
                        </div>
                    ))}
                </div>

                {task.image_url && (
                    <div className="mt-4">
                        <img
                            src={task.image_url}
                            alt={task.title}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Droppable Section Component
const TaskSection = ({ title, tasks, id, onToggleList }) => (
    <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">
            {title} ({tasks.length.toString().padStart(2, '0')})
        </h3>
        <Droppable droppableId={id}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-4 min-h-[50px] rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                    }`}
                >
                    {tasks.map((task, index) => (
                        <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                        >
                            {(provided, snapshot) => (
                                <TaskCard
                                    task={task}
                                    onToggleList={onToggleList}
                                    provided={provided}
                                    isDragging={snapshot.isDragging}
                                />
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </div>
);

// Main Component
const Index = () => {
    const [tasks, setTasks] = useState(dummyData);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddTask = async (taskData) => {
        try {
            await router.post('/tasks', taskData);
            setIsAddModalOpen(false);
            // Refresh tasks after adding
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleList = (taskId, listId) => {
        setTasks(prevTasks => {
            const newTasks = { ...prevTasks };
            Object.keys(newTasks).forEach(status => {
                newTasks[status] = newTasks[status].map(task => {
                    if (task.id === taskId) {
                        return {
                            ...task,
                            lists: task.lists.map(list =>
                                list.id === listId
                                    ? { ...list, is_completed: !list.is_completed }
                                    : list
                            )
                        };
                    }
                    return task;
                });
            });
            return newTasks;
        });
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        // Dropped outside a droppable area
        if (!destination) return;

        // If dropped in same place
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        // Create copy of tasks
        const newTasks = { ...tasks };

        // Remove task from source
        const [movedTask] = newTasks[source.droppableId].splice(source.index, 1);

        // Update task status
        movedTask.status = destination.droppableId;

        // Add task to destination
        newTasks[destination.droppableId].splice(destination.index, 0, movedTask);

        // Update state
        setTasks(newTasks);

        // Here you would typically make an API call to update the task status
        // router.put(`/tasks/${movedTask.id}`, { status: destination.droppableId });
    };

    return (
        <Main>
            <div className="min-h-screen p-6 bg-gray-50">
                {/* Header with Breadcrumb */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">TaskList</h1>
                        <div className="text-sm text-gray-500">
                            <span>Dashboard</span>
                            <span className="mx-2">/</span>
                            <span className="text-blue-600">TaskList</span>
                        </div>
                    </div>
                </div>

                {/* Tasks Header */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Tasks</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <img
                                        key={i}
                                        src={`/api/placeholder/32/32`}
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                        alt={`User ${i}`}
                                    />
                                ))}
                                <button className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5" />
                                Add task
                            </button>
                        </div>
                    </div>
                </div>

                {/* Task Sections with Drag and Drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <TaskSection
                        title="To Do's"
                        tasks={tasks.to_do}
                        id="to_do"
                        onToggleList={handleToggleList}
                    />
                    <TaskSection
                        title="In Progress"
                        tasks={tasks.in_progress}
                        id="in_progress"
                        onToggleList={handleToggleList}
                    />
                    <TaskSection
                        title="Completed"
                        tasks={tasks.completed}
                        id="completed"
                        onToggleList={handleToggleList}
                    />
                </DragDropContext>

                <AddTaskModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddTask}
                />
            </div>
        </Main>
    );
};

export default Index;
