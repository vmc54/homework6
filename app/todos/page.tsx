import { eq } from "drizzle-orm"
import { TodoList } from "@/components/TodoList"

import { db } from "@/database/db"
import { todos } from "@/database/schema"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function TodosPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user

    if (!user) return null
    const userTodos = await db.query.todos.findMany({
        where: eq(todos.userId, user.id),
        orderBy: (todos, { desc }) => [desc(todos.createdAt)]
    })

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={userTodos} />
            </section>
        </main>
    )
}
