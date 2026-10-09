import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

const STORAGE_KEYS = {
  books: "library_books",
  users: "library_users",
};

const defaultBooks = [
  {
    id: 1,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    isbn: "9780261102217",
    quantity: 5,
    available: 4,
  },
  {
    id: 2,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic",
    isbn: "9780141439518",
    quantity: 4,
    available: 3,
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self Help",
    isbn: "9780735211292",
    quantity: 3,
    available: 2,
  },
];

const defaultUsers = [
  { id: 1, name: "Mpho T", email: "mpho@example.com", role: "Member", status: "Active" },
  { id: 2, name: "Tsepo M", email: "tsepo@example.com", role: "Member", status: "Active" },
];

function App() {
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem(STORAGE_KEYS.books);
    return savedBooks ? JSON.parse(savedBooks) : defaultBooks;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.users);
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });

  const [editingBook, setEditingBook] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  const totalCopies = books.reduce((sum, book) => sum + book.quantity, 0);
  const availableCopies = books.reduce((sum, book) => sum + book.available, 0);
  const lowStockBooks = books.filter((book) => book.available <= 2);

  const handleBookSubmit = (bookData) => {
    if (editingBook) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBook.id
            ? { ...book, ...bookData, available: Math.min(book.available, bookData.quantity) }
            : book
        )
      );
      setEditingBook(null);
      return;
    }

    const newBook = {
      ...bookData,
      id: Date.now(),
      available: Number(bookData.quantity),
    };

    setBooks((prev) => [newBook, ...prev]);
  };

  const handleBookDelete = (id) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
    if (editingBook && editingBook.id === id) setEditingBook(null);
  };

  const handleBookEdit = (book) => setEditingBook(book);

  const borrowBook = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id && book.available > 0
          ? { ...book, available: book.available - 1 }
          : book
      )
    );
  };

  const returnBook = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id && book.available < book.quantity
          ? { ...book, available: book.available + 1 }
          : book
      )
    );
  };

  const handleUserSubmit = (userData) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        )
      );
      setEditingUser(null);
      return;
    }

    const newUser = { ...userData, id: Date.now() };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUserDelete = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    if (editingUser && editingUser.id === id) setEditingUser(null);
  };

  const handleUserEdit = (user) => setEditingUser(user);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Community Library</p>
            <h1>Library Management System</h1>
          </div>

          <nav className="nav">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/books">Books</NavLink>
            <NavLink to="/users">Users</NavLink>
          </nav>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                totalBooks={books.length}
                totalCopies={totalCopies}
                availableCopies={availableCopies}
                totalUsers={users.length}
                activeUsers={users.filter((user) => user.status === "Active").length}
                lowStockBooks={lowStockBooks}
              />
            }
          />

          <Route
            path="/books"
            element={
              <BooksPage
                books={books}
                onSubmit={handleBookSubmit}
                onEdit={handleBookEdit}
                onDelete={handleBookDelete}
                onBorrow={borrowBook}
                onReturn={returnBook}
                editingBook={editingBook}
                setEditingBook={setEditingBook}
              />
            }
          />

          <Route
            path="/users"
            element={
              <UsersPage
                users={users}
                onSubmit={handleUserSubmit}
                onEdit={handleUserEdit}
                onDelete={handleUserDelete}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function DashboardPage({ totalBooks, totalCopies, availableCopies, totalUsers, activeUsers, lowStockBooks }) {
  return (
    <main className="page">
      <section className="stats-grid">
        <StatCard title="Books" value={totalBooks} accent="blue" />
        <StatCard title="Copies" value={totalCopies} accent="green" />
        <StatCard title="Available" value={availableCopies} accent="teal" />
        <StatCard title="Users" value={totalUsers} accent="purple" />
      </section>

      <section className="info-grid">
        <div className="panel">
          <h2>Library Overview</h2>
          <ul className="summary-list">
            <li><span>Active Members</span><strong>{activeUsers}</strong></li>
            <li><span>Books in Stock</span><strong>{availableCopies}</strong></li>
            <li><span>Low Stock Books</span><strong>{lowStockBooks.length}</strong></li>
          </ul>
        </div>

        <div className="panel">
          <h2>Low Availability</h2>
          {lowStockBooks.length > 0 ? (
            <ul className="book-list">
              {lowStockBooks.map((book) => (
                <li key={book.id}>
                  <span>{book.title}</span>
                  <strong>{book.available} left</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">All books have sufficient stock.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function BooksPage({ books, onSubmit, onEdit, onDelete, onBorrow, onReturn, editingBook, setEditingBook }) {
  return (
    <main className="page two-column">
      <section className="panel">
        <h2>{editingBook ? "Update Book" : "Add New Book"}</h2>
        <BookForm onSubmit={onSubmit} editingBook={editingBook} />
        {editingBook && (
          <button className="secondary-button" onClick={() => setEditingBook(null)}>
            Cancel Edit
          </button>
        )}
      </section>

      <section className="panel">
        <h2>Books List</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>{book.available}</td>
                  <td className="action-group">
                    <button className="small-button" onClick={() => onBorrow(book.id)} disabled={book.available <= 0}>Borrow</button>
                    <button className="small-button secondary" onClick={() => onReturn(book.id)} disabled={book.available >= book.quantity}>Return</button>
                    <button className="small-button warning" onClick={() => onEdit(book)}>Edit</button>
                    <button className="small-button danger" onClick={() => onDelete(book.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function UsersPage({ users, onSubmit, onEdit, onDelete, editingUser, setEditingUser }) {
  return (
    <main className="page two-column">
      <section className="panel">
        <h2>{editingUser ? "Update User Account" : "Add New User"}</h2>
        <UserForm onSubmit={onSubmit} editingUser={editingUser} />
        {editingUser && (
          <button className="secondary-button" onClick={() => setEditingUser(null)}>
            Cancel Edit
          </button>
        )}
      </section>

      <section className="panel">
        <h2>User Accounts</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td className="action-group">
                    <button className="small-button warning" onClick={() => onEdit(user)}>Edit</button>
                    <button className="small-button danger" onClick={() => onDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function BookForm({ onSubmit, editingBook }) {
  const [form, setForm] = useState({
    title: editingBook?.title || "",
    author: editingBook?.author || "",
    genre: editingBook?.genre || "",
    isbn: editingBook?.isbn || "",
    quantity: editingBook?.quantity || 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      title: editingBook?.title || "",
      author: editingBook?.author || "",
      genre: editingBook?.genre || "",
      isbn: editingBook?.isbn || "",
      quantity: editingBook?.quantity || 1,
    });
    setErrors({});
  }, [editingBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.author.trim()) newErrors.author = "Author is required";
    if (!form.genre.trim()) newErrors.genre = "Genre is required";
    if (!form.isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!Number(form.quantity) || Number(form.quantity) <= 0) newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      isbn: form.isbn.trim(),
      quantity: Number(form.quantity),
    });

    if (!editingBook) {
      setForm({
        title: "",
        author: "",
        genre: "",
        isbn: "",
        quantity: 1,
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="input-group">
        <label>Author</label>
        <input name="author" value={form.author} onChange={handleChange} />
        {errors.author && <span className="error">{errors.author}</span>}
      </div>

      <div className="input-group">
        <label>Genre</label>
        <input name="genre" value={form.genre} onChange={handleChange} />
        {errors.genre && <span className="error">{errors.genre}</span>}
      </div>

      <div className="input-group">
        <label>ISBN</label>
        <input name="isbn" value={form.isbn} onChange={handleChange} />
        {errors.isbn && <span className="error">{errors.isbn}</span>}
      </div>

      <div className="input-group">
        <label>Initial Quantity</label>
        <input type="number" name="quantity" value={form.quantity} onChange={handleChange} />
        {errors.quantity && <span className="error">{errors.quantity}</span>}
      </div>

      <button type="submit" className="primary-button">
        {editingBook ? "Update Book" : "Add Book"}
      </button>
    </form>
  );
}

function UserForm({ onSubmit, editingUser }) {
  const [form, setForm] = useState({
    name: editingUser?.name || "",
    email: editingUser?.email || "",
    role: editingUser?.role || "Member",
    status: editingUser?.status || "Active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      role: editingUser?.role || "Member",
      status: editingUser?.status || "Active",
    });
    setErrors({});
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.status.trim()) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
    });

    if (!editingUser) {
      setForm({
        name: "",
        email: "",
        role: "Member",
        status: "Active",
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="input-group">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="input-group">
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Member">Member</option>
          <option value="Librarian">Librarian</option>
          <option value="Volunteer">Volunteer</option>
        </select>
      </div>

      <div className="input-group">
        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <button type="submit" className="primary-button">
        {editingUser ? "Update User" : "Add User"}
      </button>
    </form>
  );
}

function StatCard({ title, value, accent }) {
  return (
    <div className={`stat-card ${accent}`}>
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

export default App;
