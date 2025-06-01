const { createApp } = Vue

createApp({
    data() {
        return {
            todos: [],
            newTodoText: '',
            currentUser: auth.getCurrentUser(),
            isRegistering: false,
            username: '',
            password: '',
            confirmPassword: '',
            error: ''
        }
    },
    computed: {
        sortedTodos() {
            return [...this.todos].sort((a, b) => {
                // Sort by completion status first
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1
                }
                
                // Then sort by due date if both have due dates
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate)
                }
                
                // Put todos with due dates before those without
                if (a.dueDate) return -1
                if (b.dueDate) return 1
                
                // Finally, sort by creation time (id)
                return a.id - b.id
            })
        }
    },
    methods: {
        // Authentication methods
        async register() {
            this.error = ''
            
            if (this.password !== this.confirmPassword) {
                this.error = 'Passwords do not match'
                return
            }

            try {
                const user = auth.register(this.username, this.password)
                this.currentUser = user
                auth.setCurrentUser(user)
                this.resetForm()
                this.loadTodos()
            } catch (err) {
                this.error = err.message
            }
        },

        async login() {
            this.error = ''
            
            try {
                const user = auth.login(this.username, this.password)
                this.currentUser = user
                auth.setCurrentUser(user)
                this.resetForm()
                this.loadTodos()
            } catch (err) {
                this.error = err.message
            }
        },

        logout() {
            auth.logout()
            this.currentUser = null
            this.todos = []
            this.resetForm()
        },

        resetForm() {
            this.username = ''
            this.password = ''
            this.confirmPassword = ''
            this.error = ''
        },

        // Todo methods
        loadTodos() {
            if (this.currentUser) {
                this.todos = this.currentUser.todos || []
            }
        },

        addTodo() {
            if (!this.newTodoText.trim()) return

            this.todos.push({
                id: Date.now(),
                text: this.newTodoText,
                completed: false,
                editing: false,
                dueDate: ''
            })
            this.newTodoText = ''
            this.saveTodos()
        },

        removeTodo(todo) {
            const index = this.todos.indexOf(todo)
            if (index > -1) {
                this.todos.splice(index, 1)
                this.saveTodos()
            }
        },

        startEditing(todo) {
            todo.editing = true
            this.$nextTick(() => {
                const input = document.querySelector('.todo-edit-input')
                if (input) input.focus()
            })
        },

        finishEditing(todo) {
            if (!todo.text.trim()) {
                this.removeTodo(todo)
            } else {
                todo.editing = false
                this.saveTodos()
            }
        },

        saveTodos() {
            auth.saveTodos(this.todos)
        },

        formatDate(dateStr) {
            const date = new Date(dateStr)
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            // Reset time part for comparison
            today.setHours(0, 0, 0, 0)
            tomorrow.setHours(0, 0, 0, 0)
            date.setHours(0, 0, 0, 0)
            
            if (date.getTime() === today.getTime()) return 'Today'
            if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'
            
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            })
        },

        isOverdue(todo) {
            if (!todo.dueDate || todo.completed) return false
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const dueDate = new Date(todo.dueDate)
            return dueDate < today
        }
    },
    watch: {
        todos: {
            handler() {
                this.saveTodos()
            },
            deep: true
        }
    },
    mounted() {
        this.loadTodos()
    },
    directives: {
        focus: {
            mounted(el) {
                el.focus()
            }
        }
    }
}).mount('#app')