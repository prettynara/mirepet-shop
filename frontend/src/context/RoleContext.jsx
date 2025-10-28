import React, { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role") || "guest"); // 기본값: guest

  // role이 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);
  

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => useContext(RoleContext);