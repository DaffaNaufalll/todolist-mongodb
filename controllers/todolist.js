import TodolistModel from '../models/todolistModel.js';

// Create a new todo
export const createTodo = async (req, res) => {
    try {
        const { todo_image, todo_name, todo_desc, todo_status } = req.body;

        if (!todo_image || !todo_name || !todo_desc || !todo_status) {
            return res.status(400).json({ message: "Please fill in the required fields." });
        }

        const newTodo = await TodolistModel.create({
            todo_image,
            todo_name,
            todo_desc,
            todo_status
        });

        res.status(200).json({ message: "Create a to do list successfully!", newTodo });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all todos
export const getAllTodos = async (req, res) => {
    try {
        const todos = await TodolistModel.find();
        res.status(200).json(todos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Update a todo
export const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedTodo = await TodolistModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedTodo) return res.status(404).json({ message: "Todo not found" });
        res.status(200).json({ message: "Todo updated!", updatedTodo });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await TodolistModel.findByIdAndDelete(id);
        if (!deletedTodo) return res.status(404).json({ message: "Todo not found" });
        res.status(200).json({ message: "Todo deleted!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};