"use server"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

export async function createTodo(prevState: any, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user

    if (!user) {
        return { error: "You must be logged in." }
    }

    const title = formData.get("title")?.toString().trim()

    if (!title) {
        return { error: "Title cannot be empty." }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    await db.insert(todos).values({
        title,
        userId: user.id,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    revalidatePath("/todos")
    return { success: true }
}

export async function toggleTodo(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user

    if (!user) {
        return { error: "You must be logged in." }
    }

    const id = formData.get("id") as string
    const completed = formData.get("completed") === "true"

    await db.update(todos)
        .set({
            completed: !completed,
            updatedAt: new Date(),
        })
        .where(eq(todos.id, id))

    revalidatePath("/todos")
}

export async function deleteTodo(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user

    if (!user) {
        return { error: "You must be logged in." }
    }

    const id = formData.get("id") as string;
    await db.delete(todos)
        .where(eq(todos.id, id));

    revalidatePath("/admin");
}
