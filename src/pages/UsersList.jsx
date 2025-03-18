import React, { useState, useEffect } from "react";

const UsersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(savedUsers);
  }, []);

  return (
    <div className="container mt-5">
      <h2>Зарегистрированные пользователи</h2>
      <ul>
        {users.length === 0 ? (
          <p>Пользователей пока нет.</p>
        ) : (
          users.map((user, index) => (
            <li key={index}>
              {user.firstName} {user.lastName} - {user.email}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UsersList;
