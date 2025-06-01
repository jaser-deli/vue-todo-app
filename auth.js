const auth = {
    register(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        
        // Check if username already exists
        if (users.some(user => user.username === username)) {
            throw new Error('Username already exists')
        }

        // Create new user
        const user = {
            id: Date.now(),
            username,
            password: this.hashPassword(password), // In a real app, use proper password hashing
            todos: []
        }

        users.push(user)
        localStorage.setItem('users', JSON.stringify(users))
        return user
    },

    login(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find(u => u.username === username)

        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid username or password')
        }

        return user
    },

    logout() {
        localStorage.removeItem('currentUser')
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'))
    },

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
    },

    // Simple password hashing (NOT for production use)
    hashPassword(password) {
        return btoa(password)
    },

    // Save todos for current user
    saveTodos(todos) {
        const currentUser = this.getCurrentUser()
        if (!currentUser) return

        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const userIndex = users.findIndex(u => u.id === currentUser.id)
        
        if (userIndex !== -1) {
            users[userIndex].todos = todos
            localStorage.setItem('users', JSON.stringify(users))
            
            // Update current user
            currentUser.todos = todos
            this.setCurrentUser(currentUser)
        }
    }
}