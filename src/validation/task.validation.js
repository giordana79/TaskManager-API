// Schemi Joi per i task

import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow("").optional(),
  completed: Joi.boolean().optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).optional(),
  description: Joi.string().allow("").optional(),
  completed: Joi.boolean().optional(),
});
