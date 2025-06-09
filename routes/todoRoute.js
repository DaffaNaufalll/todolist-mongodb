import express from "express";
import { createTodo, deleteTodo, getAllTodos, updateTodo } from "../controllers/todolist.js";

const router = express.Router()

router.get("/get_all", getAllTodos)
router.post("/add_todo", createTodo)
router.patch("/update_todo/:id", updateTodo)
router.delete("/delete_todo/:id", deleteTodo)

export default router