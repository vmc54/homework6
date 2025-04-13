"use server"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

const todoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty")
})

export async function createTodo(prevState: any, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (!user) {
    return { error: "Not authenticated." }
  }

  const title = formData.get("title")?.toString() ?? ""
  const parsed = todoSchema.safeParse({ title })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  await db.insert(todos).values({
    title: parsed.data.title,
    completed: false,
    userId: user.id
  })

  revalidatePath("/todos")
  return { data: true }
}

export async function toggleTodo(prevState: any, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (!user) {
    return { error: "Not authenticated." }
  }

  const id = formData.get("id")?.toString()
  if (!id) return { error: "Missing ID." }

  const [todo] = await db
    .select()
    .from(todos)
    .where(eq(todos.id, id))

  if (!todo || todo.userId !== user.id) {
    return { error: "You are not authorized to toggle this todo." }
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  await db.update(todos)
    .set({ completed: !todo.completed })
    .where(eq(todos.id, id))

  revalidatePath("/todos")
  return { data: true }
}

export async function deleteTodo(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user

  if (!user || user.role !== "admin") {
    return { error: "Not authorized." }
  }

  const id = formData.get("id")?.toString()

  if (!id) {
    return { error: "Missing ID" }
  }

  await db.delete(todos).where(eq(todos.id, id))
  revalidatePath("/admin")

  return { data: true }
}