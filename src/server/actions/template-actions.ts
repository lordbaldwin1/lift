"use server";

import { headers } from "next/headers";
import { auth } from "../auth/auth";
import {
  insertWorkoutTemplate,
  deleteWorkoutTemplate,
  selectWorkoutTemplatesByUser,
  selectWorkoutTemplateById,
  updateWorkoutTemplate,
} from "../db/queries";
import type { TemplateExercise } from "../db/schema";

type CreateTemplateInput = {
  title: string;
  description: string;
  exercises: TemplateExercise[];
};

export async function createWorkoutTemplateAction(input: CreateTemplateInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to create a template.");
  }

  const trimmedTitle = input.title.trim();
  const trimmedDescription = input.description.trim();

  if (!trimmedTitle) {
    throw new Error("Template title is required.");
  }

  if (trimmedTitle.length > 50) {
    throw new Error("Template title must be 50 characters or less.");
  }

  if (trimmedDescription.length > 100) {
    throw new Error("Template description must be 100 characters or less.");
  }

  if (input.exercises.length === 0) {
    throw new Error("Template must have at least one exercise.");
  }

  const template = await insertWorkoutTemplate({
    userId: session.user.id,
    title: trimmedTitle,
    description: trimmedDescription,
    exercises: input.exercises,
  });

  return template;
}

export async function deleteWorkoutTemplateAction(templateId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete a template.");
  }

  const userTemplates = await selectWorkoutTemplatesByUser(session.user.id);
  const templateToDelete = userTemplates.find((t) => t.id === templateId);

  if (!templateToDelete) {
    throw new Error("Template not found or you don't have permission to delete it.");
  }

  const deletedTemplate = await deleteWorkoutTemplate(templateId);
  return deletedTemplate;
}

export async function getWorkoutTemplateAction(templateId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to view a template.");
  }

  const template = await selectWorkoutTemplateById(templateId);

  if (!template) {
    throw new Error("Template not found.");
  }

  if (template.userId !== session.user.id) {
    throw new Error("You don't have permission to view this template.");
  }

  return template;
}

type UpdateTemplateInput = {
  templateId: string;
  title: string;
  description: string;
  exercises: TemplateExercise[];
};

export async function updateWorkoutTemplateAction(input: UpdateTemplateInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update a template.");
  }

  const existingTemplate = await selectWorkoutTemplateById(input.templateId);

  if (!existingTemplate) {
    throw new Error("Template not found.");
  }

  if (existingTemplate.userId !== session.user.id) {
    throw new Error("You don't have permission to update this template.");
  }

  const trimmedTitle = input.title.trim();
  const trimmedDescription = input.description.trim();

  if (!trimmedTitle) {
    throw new Error("Template title is required.");
  }

  if (trimmedTitle.length > 50) {
    throw new Error("Template title must be 50 characters or less.");
  }

  if (trimmedDescription.length > 100) {
    throw new Error("Template description must be 100 characters or less.");
  }

  if (input.exercises.length === 0) {
    throw new Error("Template must have at least one exercise.");
  }

  const updatedTemplate = await updateWorkoutTemplate(
    input.templateId,
    trimmedTitle,
    trimmedDescription,
    input.exercises
  );

  return updatedTemplate;
}

